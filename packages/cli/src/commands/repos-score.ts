import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import pLimit from "p-limit";
import { createObjectCsvWriter } from "csv-writer";
import { Octokit } from "@octokit/rest";
import { App as OctokitApp } from "@octokit/app";

type Weights = {
  weights: {
    volume: number;
    labels: number;
    recent_activity_90d: number;
    license_permissive: number;
    templates: number;
    language_alignment: number;
    diversity: number;
    private_ready: number;
  };
  caps: { volume_max: number; recent_activity_max: number };
  language_alignment: { primary_whitelist: string[] };
};

const permissive = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "Unlicense",
]);

const dateNDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

function readWeights(file = "configs/repo_scoring.yaml"): Weights {
  const yml = fs.readFileSync(file, "utf8");
  return parseYaml(yml) as Weights;
}

async function readCandidates(fileArg?: string, args?: string[]): Promise<string[]> {
  if (args && args.length) {
    // treat positionals as repo full_names
    return args.filter((a) => a !== "--file" && a !== fileArg);
  }
  const f = fileArg || "docs/repo_candidates.txt";
  return fs
    .readFileSync(f, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pemFromB64(b64?: string) {
  return b64 ? Buffer.from(b64, "base64").toString("utf8") : "";
}

async function makeOctokit(): Promise<Octokit> {
  const token = process.env.GITHUB_TOKEN;
  const appId = process.env.GITHUB_APP_ID;
  const keyB64 = process.env.GITHUB_PRIVATE_KEY_BASE64;
  const instId = process.env.GITHUB_INSTALLATION_ID;

  if (appId && keyB64 && instId) {
    const app = new OctokitApp({
      appId: Number(appId),
      privateKey: pemFromB64(keyB64),
    });
    // getInstallationOctokit returns an authenticated Octokit
    const inst = (await (app as any).getInstallationOctokit(
      Number(instId)
    )) as Octokit;
    return inst;
  }

  if (token) {
    return new Octokit({
      auth: token,
      userAgent: "gh-triage/cli repos-score",
    });
  }

  throw new Error(
    "Set GITHUB_TOKEN or (GITHUB_APP_ID, GITHUB_PRIVATE_KEY_BASE64, GITHUB_INSTALLATION_ID)"
  );
}

async function labelsCount(octo: Octokit, owner: string, repo: string): Promise<number> {
  let page = 1,
    total = 0;
  for (; ;) {
    const { data } = await octo.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100,
      page,
    });
    total += data.length;
    if (data.length < 100) break;
    page++;
  }
  return total;
}

async function hasIssueTemplates(
  octo: Octokit,
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    await octo.repos.getContent({ owner, repo, path: ".github/ISSUE_TEMPLATE" });
    return true;
  } catch {
    try {
      await octo.repos.getContent({
        owner,
        repo,
        path: ".github/ISSUE_TEMPLATE.md",
      });
      return true;
    } catch {
      return false;
    }
  }
}

async function recentActivityCount(
  octo: Octokit,
  owner: string,
  repo: string,
  days = 90
): Promise<number> {
  const since = dateNDaysAgo(days);
  const q = `repo:${owner}/${repo} updated:>=${since}`;
  const { data } = await octo.search.issuesAndPullRequests({ q, per_page: 1 });
  // @ts-ignore total_count is present on the REST search response
  return data.total_count ?? 0;
}

async function languageDiversity(
  octo: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const { data } = await octo.repos.listLanguages({ owner, repo });
    return Object.keys(data ?? {}).length;
  } catch {
    return 0;
  }
}

async function fetchRepo(octo: Octokit, full: string) {
  const [owner, repo] = full.split("/");
  const { data: r } = await octo.repos.get({ owner, repo });

  const [labels, hasTpl, recent, langDiv] = await Promise.all([
    labelsCount(octo, owner, repo),
    hasIssueTemplates(octo, owner, repo),
    recentActivityCount(octo, owner, repo, 90),
    languageDiversity(octo, owner, repo),
  ]);

  const volume =
    (r.open_issues_count ?? 0) +
    (r.forks_count ?? 0) +
    (r.stargazers_count ?? 0);

  return {
    full_name: r.full_name,
    private: !!r.private,
    primary_language: r.language ?? null,
    license_spdx: r.license?.spdx_id ?? null,
    features: {
      volume,
      labels,
      recent_activity_90d: recent,
      license_permissive: r.license?.spdx_id
        ? permissive.has(r.license.spdx_id)
          ? 1
          : 0
        : 0,
      templates: hasTpl ? 1 : 0,
      language_alignment: 0,
      diversity: langDiv,
      private_ready: r.private ? 1 : 0,
    },
  };
}

function normalizeAndScore(rows: any[], cfg: Weights) {
  // enrich + cap
  for (const row of rows) {
    const lang = (row.primary_language || "").toString();
    row.features.language_alignment = cfg.language_alignment.primary_whitelist.some(
      (w) => w.toLowerCase() === lang.toLowerCase()
    )
      ? 1
      : 0;
    row.features.volume = Math.min(row.features.volume, cfg.caps.volume_max);
    row.features.recent_activity_90d = Math.min(
      row.features.recent_activity_90d,
      cfg.caps.recent_activity_max
    );
  }

  // min-max on selected numeric features
  const keys = ["volume", "labels", "recent_activity_90d", "diversity"] as const;
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  for (const k of keys) {
    const vals = rows.map((r) => r.features[k]);
    mins[k] = Math.min(...vals, 0);
    maxs[k] = Math.max(...vals, 1);
  }
  const mm = (x: number, k: string) =>
    maxs[k] === mins[k] ? 0 : (x - mins[k]) / (maxs[k] - mins[k]);

  return rows
    .map((r) => {
      const f = r.features,
        w = cfg.weights;
      const norm = {
        volume: mm(f.volume, "volume"),
        labels: mm(f.labels, "labels"),
        recent_activity_90d: mm(f.recent_activity_90d, "recent_activity_90d"),
        diversity: mm(f.diversity, "diversity"),
        license_permissive: f.license_permissive,
        templates: f.templates,
        language_alignment: f.language_alignment,
        private_ready: f.private_ready,
      };
      const score =
        norm.volume * w.volume +
        norm.labels * w.labels +
        norm.recent_activity_90d * w.recent_activity_90d +
        norm.license_permissive * w.license_permissive +
        norm.templates * w.templates +
        norm.language_alignment * w.language_alignment +
        norm.diversity * w.diversity +
        norm.private_ready * w.private_ready;

      return { ...r, norm, score: Number(score.toFixed(4)) };
    })
    .sort((a, b) => b.score - a.score);
}

export async function main(args: string[]) {
  const fileFlagIdx = args.indexOf("--file");
  const fileArg = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : undefined;
  const positional = args.filter(
    (a, i) => i !== fileFlagIdx && i !== fileFlagIdx + 1 && a !== "--file"
  );

  const repos = await readCandidates(fileArg, positional);
  if (!repos.length) throw new Error("No repos specified (args or --file).");

  const cfg = readWeights();
  const octo = await makeOctokit();
  const limiter = pLimit(4);
  const fetched = await Promise.all(
    repos.map((r) => limiter(() => fetchRepo(octo, r)))
  );
  const scored = normalizeAndScore(fetched, cfg);

  const outDir = "docs";
  fs.mkdirSync(outDir, { recursive: true });

  const csvPath = path.join(outDir, "repo_matrix.csv");
  const csv = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: "full_name", title: "full_name" },
      { id: "private", title: "private" },
      { id: "primary_language", title: "primary_language" },
      { id: "license_spdx", title: "license_spdx" },
      { id: "labels", title: "labels" },
      { id: "recent_activity_90d", title: "recent_activity_90d" },
      { id: "volume", title: "volume" },
      { id: "diversity", title: "diversity" },
      { id: "license_permissive", title: "license_permissive" },
      { id: "templates", title: "templates" },
      { id: "language_alignment", title: "language_alignment" },
      { id: "private_ready", title: "private_ready" },
      { id: "score", title: "score" },
    ],
  });

  await csv.writeRecords(
    scored.map((r) => ({
      full_name: r.full_name,
      private: r.private,
      primary_language: r.primary_language ?? "",
      license_spdx: r.license_spdx ?? "",
      labels: r.features.labels,
      recent_activity_90d: r.features.recent_activity_90d,
      volume: r.features.volume,
      diversity: r.features.diversity,
      license_permissive: r.features.license_permissive,
      templates: r.features.templates,
      language_alignment: r.features.language_alignment,
      private_ready: r.features.private_ready,
      score: r.score,
    }))
  );

  const jsonPath = path.join(outDir, "repo_matrix_ranked.json");
  fs.writeFileSync(jsonPath, JSON.stringify(scored, null, 2));

  console.log(`Wrote: ${csvPath}`);
  console.log(`Wrote: ${jsonPath}`);
  console.log("Top 3:");
  for (const r of scored.slice(0, 3)) {
    console.log(` - ${r.full_name}: ${r.score}`);
  }
}
