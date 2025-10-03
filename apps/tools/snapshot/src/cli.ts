import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import "dotenv/config";
import { ensureDir } from "./io.js";
import { fetchIssues, fetchPulls, fetchLabels, fetchCommits } from "./fetch.js";
import { SnapshotManifestV1, StatsJson } from "@ghtriage/schemas/datasets/snapshot";
import { makeOctokitFromEnv } from "./token.js";

const now = () => new Date().toISOString();
const DBG = process.env.DEBUG === "1" || process.env.DEBUG === "true";

// simple flag helpers
function flag(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
}

const manifestPath = process.argv[2] || "datasets/snapshots/manifest.yaml";
const onlySlug = flag("only"); // "owner__repo"
const types = (flag("types") || "issues,pulls,labels,commits")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const maxPages = flag("max-pages") ? Number(flag("max-pages")) : undefined;
const sinceOverride = flag("since");
const untilOverride = flag("until");
const directionFlag = flag("direction") as "asc" | "desc" | undefined; // manual override

// Create a single client for the whole run (prefer GitHub App; fall back to PAT)
let octo;
let authKind: "app" | "pat";
let who = "";
try {
    const r = await makeOctokitFromEnv();
    octo = r.octo;
    authKind = r.kind;
    who = r.who;
    console.log(`Auth OK as: ${who}${authKind === "app" ? " [GitHub App]" : ""}`);
} catch (e: any) {
    console.error(String(e?.message || e));
    process.exit(1);
}

async function main() {
    const doc = yaml.load(fs.readFileSync(manifestPath, "utf8"));
    const manifest = SnapshotManifestV1.parse(doc);

    for (const r of manifest.repos) {
        const win = {
            since: sinceOverride ?? (r.window?.since ?? (r as any).since ?? (manifest as any).window?.since),
            until: untilOverride ?? (r.window?.until ?? (r as any).until ?? (manifest as any).window?.until),
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
        let lRes = { n: 0 };
        let cRes = { n: 0 };
        const promises: Promise<any>[] = [];
        if (types.includes("issues")) promises.push(fetchIssues(ctxBase).then((v) => (iRes = v)));
        if (types.includes("pulls")) promises.push(fetchPulls(ctxBase).then((v) => (pRes = v)));
        if (types.includes("labels")) promises.push(fetchLabels(ctxBase).then((v) => (lRes = v)));
        if (types.includes("commits")) promises.push(fetchCommits(ctxBase).then((v) => (cRes = v)));
        if (promises.length) await Promise.all(promises);

        // Persist stats
        const stats = StatsJson.parse({
            repo: slug,
            window: win,
            counts: {
                issues: iRes.n,
                pulls: pRes.n,
                commits: cRes.n,
                labels: lRes.n,
                sample_issues: iRes.s,
                sample_pulls: pRes.s,
            },
            generated_at: now(),
        });

        // Add acceptance note from manifest
        const target = r.labels_target_per_class ?? 20;
        const acceptance = {
            target_label_min: target,
            note: "See sampler coverage report.",
        };

        // Compute per_label_counts + sample_size from balanced sample if present
        let perLabelCounts: Record<string, number> = {};
        let sampleSize = iRes.s + pRes.s;
        try {
            const balancedPath = path.join(sampleDir, "issues.sample.balanced.jsonl");
            if (fs.existsSync(balancedPath)) {
                const rows = fs
                    .readFileSync(balancedPath, "utf8")
                    .trim()
                    .split(/\r?\n/)
                    .map((line) => JSON.parse(line));

                sampleSize = rows.length;
                for (const row of rows) {
                    const labels = row.labels ?? ["_none_"];
                    for (const lbl of labels) {
                        const name = typeof lbl === "string" ? lbl : lbl.name || "_none_";
                        perLabelCounts[name] = (perLabelCounts[name] || 0) + 1;
                    }
                }
            }
        } catch (e) {
            console.warn(`[warn] failed to compute per_label_counts for ${slug}:`, e);
        }

        // Merge stats + acceptance into final payload
        const finalStats = {
            ...stats,
            acceptance,
            sample_size: sampleSize,
            per_label_counts: perLabelCounts,
        };

        fs.writeFileSync(
            path.join(metaDir, "stats.json"),
            JSON.stringify(finalStats, null, 2),
        );

        console.log(`[ok] ${slug} counts →`, stats.counts);
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(2);
});
