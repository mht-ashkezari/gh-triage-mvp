import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { ensureDir } from "./io.js";
import { fetchIssues, fetchPulls } from "./fetch.js";
import { SnapshotManifestV1, StatsJson } from "@ghtriage/schemas/datasets/snapshot";
import { getAuthOctokit } from "./token.js";

const now = () => new Date().toISOString();
const DBG = process.env.DEBUG === "1" || process.env.DEBUG === "true";

// simple flag helpers
function flag(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
}

const manifestPath = process.argv[2] || "datasets/snapshots/manifest.yaml";
const onlySlug = flag("only"); // "owner__repo"
const types = (flag("types") || "issues,pulls")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const maxPages = flag("max-pages") ? Number(flag("max-pages")) : undefined;
const sinceOverride = flag("since");
const untilOverride = flag("until");
const directionFlag = flag("direction") as "asc" | "desc" | undefined; // manual override

// Create a single client for the whole run
const octo = await getAuthOctokit();

// Optional: friendlier auth sanity check
try {
    const me = await octo.request("GET /user");
    const who = me.data?.login ?? "(installation token)";
    console.log(`Auth OK as: ${who}`);
} catch (e: any) {
    if (e?.status === 401) {
        console.error(
            "GitHub auth failed (401). Set a valid GITHUB_TOKEN or App envs (GITHUB_APP_ID, GITHUB_PRIVATE_KEY_BASE64, GITHUB_INSTALLATION_ID).",
        );
    }
    throw e;
}

async function main() {
    const doc = yaml.load(fs.readFileSync(manifestPath, "utf8"));
    const manifest = SnapshotManifestV1.parse(doc);

    for (const r of manifest.repos) {
        const win = {
            since: sinceOverride ?? (r.window?.since ?? (manifest as any).window?.since),
            until: untilOverride ?? (r.window?.until ?? (manifest as any).window?.until),
        };
        const slug = `${r.owner}__${r.name}`;
        if (onlySlug && slug !== onlySlug) continue;

        const base = path.join("datasets/snapshots", slug);
        const rawDir = path.join(base, "raw");
        const sampleDir = path.join(base, "sample");
        const metaDir = path.join(base, "meta");
        [rawDir, sampleDir, metaDir].forEach(ensureDir);

        // Effective manifest (frozen) for traceability
        fs.writeFileSync(
            path.join(metaDir, "manifest.effective.json"),
            JSON.stringify({ repo: slug, window: win, at: now(), manifest_version: (manifest as any).version }, null, 2),
        );

        // Auto-pick direction if not provided:
        // - if we have an 'until', use 'asc' so first pages fall inside the window
        // - otherwise 'desc' (latest-first)
        const direction: "asc" | "desc" = directionFlag ?? (win.until ? "asc" : "desc");

        if (DBG) {
            console.log(`[dbg] repo=${slug} window=[${win.since || "-"}..${win.until || "-"}] direction=${direction} maxPages=${maxPages ?? "-"} types=${types.join(",")}`);
        }

        const ctxBase = {
            octo,
            owner: r.owner,
            repo: r.name,
            rawDir,
            sampleDir,
            since: win.since,
            until: win.until,
            maxPages,
            direction,
            onProgress: (kind: "issues" | "pulls", t: { rows: number; pages: number }) =>
                console.log(`[${slug}] ${kind}: ${t.rows} rows across ${t.pages} pages`),
        };

        let iRes = { n: 0, s: 0 };
        let pRes = { n: 0, s: 0 };

        const promises: Promise<any>[] = [];
        if (types.includes("issues")) promises.push(fetchIssues(ctxBase).then((v) => (iRes = v)));
        if (types.includes("pulls")) promises.push(fetchPulls(ctxBase).then((v) => (pRes = v)));
        if (promises.length) await Promise.all(promises);

        // Persist stats
        const stats = StatsJson.parse({
            repo: slug,
            window: win,
            counts: {
                issues: iRes.n,
                pulls: pRes.n,
                commits: 0,
                labels: 0,
                sample_issues: iRes.s,
                sample_pulls: pRes.s,
            },
            generated_at: now(),
        });
        fs.writeFileSync(path.join(metaDir, "stats.json"), JSON.stringify(stats, null, 2));
        console.log(`[ok] ${slug} counts →`, stats.counts);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(2);
});
