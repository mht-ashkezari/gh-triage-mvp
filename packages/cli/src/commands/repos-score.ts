import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import pLimit from "p-limit";
import { createObjectCsvWriter } from "csv-writer";
import { Octokit as RestOctokit } from "@octokit/rest";
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
  // Gather positionals (repo full_names) by filtering out known flags & their values
  const positionals =
    (args ?? [])
      .filter(Boolean)
      .filter((a, i, arr) => {
        // drop separators and flags
        if (a === "--" || a === "--file") return false;
        // drop the flag value after --file
        const fileIdx = arr.indexOf("--file");
        if (fileIdx >= 0 && i === fileIdx + 1) return false;
        return true;
      });

  if (positionals.length > 0) {
    return positionals;
  }

  // No positionals? Read from file (default path or the explicit --file value)
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

/**
 * Returns an Octokit instance you can use with REST routes.
 * - If PAT is present -> @octokit/rest instance (has .repos, .issues, etc.)
 * - Else if App envs present -> installation Octokit (Core) -> use .request("GET /..")
 */
async function makeOctokit(): Promise<any> {
  const token = process.env.GITHUB_TOKEN;
  const appId = process.env.GITHUB_APP_ID;
  const keyB64 = process.env.GITHUB_PRIVATE_KEY_BASE64;
  const instId = process.env.GITHUB_INSTALLATION_ID;

  if (token) {
    return new RestOctokit({ auth: token, userAgent: "gh-triage/cli repos-score" });
  }

  if (appId && keyB64 && instId) {
    const app = new OctokitApp({
      appId: Number(appId),
      privateKey: pemFromB64(keyB64),
    });
    // NOTE: getInstallationOctokit returns a Core client (no .repos namespace).
    // We will call .request("GET /...") everywhere to be compatible.
    const installationOctokit = await (app as any).getInstallationOctokit(Number(instId));
    return installationOctokit;
  }

  throw new Error(
    "Set GITHUB_TOKEN or (GITHUB_APP_ID, GITHUB_PRIVATE_KEY_BASE64, GITHUB_INSTALLATION_ID)"
  );
}

async function recentActivityCount(octo: any, owner: string, repo: string, days = 90): Promise<number> {
  const since = dateNDaysAgo(days);
  // Core-compatible search via .request
  const { data } = await octo.request("GET /search/issues", {
    q: `repo:${owner}/${repo} updated:>=${since}`,
    per_page: 1,
  });
  return data.total_count ?? 0;
}

async function hasIssueTemplates(octo: any, owner: string, repo: string): Promise<boolean> {
  try {
    await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: ".github/ISSUE_TEMPLATE",
    });
    return true;
  } catch {
    return false;
  }
}

async function countLabels(octo: any, owner: string, repo: string): Promise<number> {
  let total = 0;
  let page = 1;
  for (; ;) {
    const { data } = await octo.request("GET /repos/{owner}/{repo}/labels", {
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

async function fetchRepo(octo: any, fullName: string) {
  const [owner, repo] = fullName.split("/");
  // repo metadata
  const { data: r } = await octo.request("GET /repos/{owner}/{repo}", { owner, repo });

  // license
  const license = r.license?.spdx_id ?? "";
  const licensePermissive = permissive.has(license) ? 1 : 0;

  // language stats
  const { data: langs } = await octo.request("GET /repos/{owner}/{repo}/languages", { owner, repo });
  const diversity = Object.keys(langs || {}).length;
  let primary = "";
  let max = -1;
  for (const [k, v] of Object.entries(langs || {})) {
    const n = Number(v);
    if (n > max) {
      max = n;
      primary = k;
    }
  }

  // labels
  const labels = await countLabels(octo, owner, repo);

  // templates
  const templates = await hasIssueTemplates(octo, owner, repo);

  // recent activity
  const recent = await recentActivityCount(octo, owner, repo, 90);

  // volume proxy: open issues/PRs + watchers/forks
  const volume =
    Number(r.open_issues_count ?? 0) +
    Number(r.watchers_count ?? 0) +
    Number(r.forks_count ?? 0);

  return {
    full_name: r.full_name,
    private: !!r.private,
    language_primary: primary,
    license_spdx: license,
    features: {
      volume,
      labels,
      recent_activity_90d: recent,
      license_permissive: licensePermissive,
      templates: templates ? 1 : 0,
      language_alignment: 0, // compute later with weights
      diversity,
      private_ready: r.private ? 1 : 0,
    },
  };
}

function computeScore(entry: any, weights: Weights) {
  const w = weights.weights;
  const caps = weights.caps;
  const wl = new Set(
    (weights.language_alignment?.primary_whitelist ?? []).map((s) => s.toLowerCase())
  );

  const normVolume = Math.min(entry.features.volume / (caps.volume_max || 1), 1);
  const normRecent = Math.min(entry.features.recent_activity_90d / (caps.recent_activity_max || 1), 1);
  const langAligned = wl.has((entry.language_primary ?? "").toLowerCase()) ? 1 : 0;

  const score =
    normVolume * w.volume +
    entry.features.labels * w.labels * 0.001 + // light weight per label
    normRecent * w.recent_activity_90d +
    entry.features.license_permissive * w.license_permissive +
    entry.features.templates * w.templates +
    langAligned * w.language_alignment +
    entry.features.diversity * w.diversity * 0.05 + // light weight per language
    entry.features.private_ready * w.private_ready;

  entry.features.language_alignment = langAligned;
  entry.score = Number(score.toFixed(4));
  return entry;
}

export async function main(args: string[]) {
  // args could contain: ["--file", "path", "...repos"]
  const fileFlagIdx = args.indexOf("--file");
  const fileArg = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : undefined;

  const weights = readWeights();
  const candidates = await readCandidates(fileArg, args);
  if (!candidates.length) {
    console.error("No candidates found. Provide repos as args or docs/repo_candidates.txt");
    process.exit(2);
  }

  const octo = await makeOctokit();

  const limit = pLimit(5);
  const fetched = await Promise.all(
    candidates.map((full) => limit(() => fetchRepo(octo, full)))
  );

  const scored = fetched.map((f) => computeScore(f, weights)).sort((a, b) => b.score - a.score);

  const outDir = "docs";
  fs.mkdirSync(outDir, { recursive: true });

  const csvPath = path.join(outDir, "repo_matrix.csv");
  const csv = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: "full_name", title: "full_name" },
      { id: "private", title: "private" },
      { id: "language_primary", title: "language_primary" },
      { id: "license_spdx", title: "license_spdx" },
      { id: "volume", title: "volume" },
      { id: "labels", title: "labels" },
      { id: "recent_activity_90d", title: "recent_activity_90d" },
      { id: "license_permissive", title: "license_permissive" },
      { id: "templates", title: "templates" },
      { id: "language_alignment", title: "language_alignment" },
      { id: "diversity", title: "diversity" },
      { id: "private_ready", title: "private_ready" },
      { id: "score", title: "score" },
    ],
  });

  await csv.writeRecords(
    scored.map((r) => ({
      full_name: r.full_name,
      private: r.private,
      language_primary: r.language_primary,
      license_spdx: r.license_spdx,
      volume: r.features.volume,
      labels: r.features.labels,
      recent_activity_90d: r.features.recent_activity_90d,
      license_permissive: r.features.license_permissive,
      templates: r.features.templates,
      language_alignment: r.features.language_alignment,
      diversity: r.features.diversity,
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
