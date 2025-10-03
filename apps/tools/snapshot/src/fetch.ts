import type { Octokit } from "@octokit/rest";
import { JSONLWriter } from "./io.js";
import { sanitizeBody } from "./redact.js";
import { url } from "node:inspector";

export type Ctx = {
    octo: Octokit;
    owner: string;
    repo: string;
    rawDir: string;
    sampleDir: string;
    since?: string; // ISO
    until?: string; // ISO
    onProgress?: (kind: "issues" | "pulls", totals: { rows: number; pages: number }) => void;
    maxPages?: number; // soft cap for smoke runs
    direction?: "asc" | "desc"; // fetch order; default auto-picked in CLI
};

const firstLine = (s?: string) => (s ?? "").split("\n")[0];


const DBG = process.env.DEBUG === "1" || process.env.DEBUG === "true";
const toDate = (s?: string) => (s ? new Date(s) : undefined);
const inWindow = (iso: string, sinceD?: Date, untilD?: Date) => {
    const d = new Date(iso);
    if (Number.isNaN(+d)) return false;
    if (sinceD && d < sinceD) return false;
    if (untilD && d > untilD) return false;
    return true;
};

function pageBounds(arr: any[]) {
    if (!arr?.length) return { first: undefined, last: undefined };
    const first = arr[0]?.updated_at ?? arr[0]?.updatedAt ?? arr[0]?.updated;
    const last = arr[arr.length - 1]?.updated_at ?? arr[arr.length - 1]?.updatedAt ?? arr[arr.length - 1]?.updated;
    return { first, last };
}

export async function fetchLabels(ctx: Ctx) {
    const rawW = new JSONLWriter(`${ctx.rawDir}/labels.jsonl`);
    let rows = 0, pages = 0;

    try {
        const iterator = ctx.octo.paginate.iterator(ctx.octo.issues.listLabelsForRepo, {
            owner: ctx.owner, repo: ctx.repo, per_page: 100,
        });
        for await (const page of iterator) {
            pages++;
            for (const l of page.data as any[]) {
                rawW.write({ name: l.name, color: l.color, description: l.description ?? null });
                rows++;
            }
            if (ctx.maxPages && pages >= ctx.maxPages) break;
        }
        await rawW.commit();
        return { n: rows };
    } catch (e) {
        await rawW.abort(); throw e;
    }
}

export async function fetchCommits(ctx: Ctx) {
    const rawW = new JSONLWriter(`${ctx.rawDir}/commits.jsonl`);
    let rows = 0, pages = 0;

    try {
        const iterator = ctx.octo.paginate.iterator(ctx.octo.repos.listCommits, {
            owner: ctx.owner,
            repo: ctx.repo,
            per_page: 100,
            since: ctx.since,
            until: ctx.until,
        });

        for await (const page of iterator) {
            pages++;
            for (const c of page.data as any[]) {
                const meta = c.commit ?? {};
                const msg = meta.message ?? "";
                const { short, sha } = sanitizeBody(msg); // sanitize commit message

                rawW.write({
                    sha: c.sha,
                    author_login: c.author?.login ?? null,
                    committer_login: c.committer?.login ?? null,
                    message_firstline: firstLine(msg),
                    message_short: short,   // NEW: PII-safe snippet
                    message_sha: sha,       // NEW: stable hash
                    date: meta.author?.date ?? meta.committer?.date ?? new Date().toISOString(),
                    url: c.html_url ?? null, // handy for audits
                });
                rows++;
            }
            if (ctx.maxPages && pages >= ctx.maxPages) break;
        }

        await rawW.commit();
        return { n: rows };
    } catch (e) {
        await rawW.abort();
        throw e;
    }
}




export async function fetchIssues(ctx: Ctx) {
    const rawW = new JSONLWriter(`${ctx.rawDir}/issues.jsonl`);
    const sampleW = new JSONLWriter(`${ctx.sampleDir}/issues.sample.jsonl`);
    let rows = 0, pages = 0;

    const sinceD = toDate(ctx.since);
    const untilD = toDate(ctx.until);
    const direction: "asc" | "desc" = ctx.direction ?? (ctx.until ? "asc" : "desc");

    try {
        const iterator = ctx.octo.paginate.iterator(ctx.octo.issues.listForRepo, {
            owner: ctx.owner,
            repo: ctx.repo,
            state: "all",
            per_page: 100,
            since: ctx.since, // native lower bound by updated_at
            sort: "updated",
            direction,
        });

        for await (const page of iterator) {
            pages++;
            const data = page.data as any[];
            if (DBG) {
                const b = pageBounds(data);
                console.log(`[dbg][issues] page=${pages} dir=${direction} first=${b.first} last=${b.last} win=[${ctx.since || "-"}..${ctx.until || "-"}]`);
            }
            if (!data?.length) {
                ctx.onProgress?.("issues", { rows, pages });
                if (ctx.maxPages && pages >= ctx.maxPages) break;
                continue;
            }

            for (const row of data) {
                const at = row.updated_at ?? row.updatedAt ?? row.updated;
                if (!inWindow(at, sinceD, untilD)) continue;
                const { record, sample } = issueRecord(row);
                rawW.write(record); sampleW.write(sample); rows++;
                if (rows % 500 === 0) ctx.onProgress?.("issues", { rows, pages });
            }

            const last = data[data.length - 1];
            const lastAt = last?.updated_at ?? last?.updatedAt ?? last?.updated;
            if (direction === "desc") {
                if (sinceD && lastAt && new Date(lastAt) < sinceD) break;
            } else {
                if (untilD && lastAt && new Date(lastAt) > untilD) break;
            }

            ctx.onProgress?.("issues", { rows, pages });
            if (ctx.maxPages && pages >= ctx.maxPages) break;
        }

        await Promise.all([rawW.commit(), sampleW.commit()]);
        return { n: rows, s: rows };
    } catch (e) {
        await Promise.all([rawW.abort(), sampleW.abort()]);
        throw e;
    }
}

/**
 * Pulls (robust): fetch via Issues API (has `since`) and keep only rows with `pull_request`.
 * This respects windowing, supports ASC/DESC, and early-breaks quickly.
 */
export async function fetchPulls(ctx: Ctx) {
    const rawW = new JSONLWriter(`${ctx.rawDir}/pulls.jsonl`);
    const sampleW = new JSONLWriter(`${ctx.sampleDir}/pulls.sample.jsonl`);
    let rows = 0, pages = 0;

    const sinceD = toDate(ctx.since);
    const untilD = toDate(ctx.until);
    const direction: "asc" | "desc" = ctx.direction ?? (ctx.until ? "asc" : "desc");

    try {
        const iterator = ctx.octo.paginate.iterator(ctx.octo.issues.listForRepo, {
            owner: ctx.owner,
            repo: ctx.repo,
            state: "all",
            per_page: 100,
            since: ctx.since, // <-- key: respected by Issues API
            sort: "updated",
            direction,
        });

        for await (const page of iterator) {
            pages++;
            const data = (page.data as any[]).filter((r) => !!r.pull_request); // keep PRs only
            if (DBG) {
                const bAll = pageBounds(page.data as any[]);
                console.log(`[dbg][pulls-via-issues] page=${pages} dir=${direction} first=${bAll.first} last=${bAll.last} win=[${ctx.since || "-"}..${ctx.until || "-"}] kept=${data.length}`);
            }
            if (!data?.length) {
                ctx.onProgress?.("pulls", { rows, pages });
                if (ctx.maxPages && pages >= ctx.maxPages) break;
                continue;
            }

            for (const row of data) {
                const at = row.updated_at ?? row.updatedAt ?? row.updated;
                if (!inWindow(at, sinceD, untilD)) continue;
                const { record, sample } = pullRecordFromIssueRow(row);
                rawW.write(record); sampleW.write(sample); rows++;
                if (rows % 500 === 0) ctx.onProgress?.("pulls", { rows, pages });
            }

            const last = (page.data as any[]).at(-1);
            const lastAt = last?.updated_at ?? last?.updatedAt ?? last?.updated;
            if (direction === "desc") {
                if (sinceD && lastAt && new Date(lastAt) < sinceD) break;
            } else {
                if (untilD && lastAt && new Date(lastAt) > untilD) break;
            }

            ctx.onProgress?.("pulls", { rows, pages });
            if (ctx.maxPages && pages >= ctx.maxPages) break;
        }

        await Promise.all([rawW.commit(), sampleW.commit()]);
        return { n: rows, s: rows };
    } catch (e) {
        await Promise.all([rawW.abort(), sampleW.abort()]);
        throw e;
    }
}

/* ---------- helpers to build records ---------- */

function issueRecord(row: any) {
    const { short, sha } = sanitizeBody(row.body);

    // extract label strings once
    const labelNames =
        Array.isArray(row.labels)
            ? row.labels
                .map((l: any) => (typeof l === "string" ? l : l?.name))
                .filter(Boolean)
                .map((s: string) => s.trim())
            : [];

    const record = {
        id: row.id,
        number: row.number,
        title: row.title ?? "",
        state: row.state,
        created_at: row.created_at,
        updated_at: row.updated_at,
        closed_at: row.closed_at ?? null,
        user_login: row.user?.login ?? null,
        labels: labelNames,
        is_pull_request: !!row.pull_request,
        body_short: short,
        body_sha: sha,
        body_sha256: sha,
        url: row.html_url ?? null,
    };
    const sample = {
        id: record.id,
        number: record.number,
        title: record.title,
        state: record.state,
        created_at: record.created_at,
        labels: labelNames,
        is_pull_request: record.is_pull_request,
        body_short: short.slice(0, 800),
        url: record.url,
    };
    return { record, sample };
}

function pullRecordFromIssueRow(row: any) {
    const { short, sha } = sanitizeBody(row.body);

    const labelNames =
        Array.isArray(row.labels)
            ? row.labels
                .map((l: any) => (typeof l === "string" ? l : l?.name))
                .filter(Boolean)
                .map((s: string) => s.trim())
            : [];


    const record = {
        id: row.id,
        number: row.number,
        title: row.title ?? "",
        state: row.state,
        created_at: row.created_at,
        updated_at: row.updated_at,
        merged_at: null as string | null, // optional future enrichment
        user_login: row.user?.login ?? null,
        labels: labelNames,
        body_short: short,
        body_sha: sha,
        url: row.html_url ?? null,

    };
    const sample = {
        id: record.id,
        number: record.number,
        title: record.title,
        state: record.state,
        created_at: record.created_at,
        merged_at: record.merged_at,
        labels: labelNames,
        body_short: short.slice(0, 800),
        url: record.url,
        is_pull_request: true,  // explicit (since this is the PR path)
    };
    return { record, sample };
}
