import crypto from "node:crypto";

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export const redactIssueBodyToHash = (body?: string | null) => body ? sha256(body.slice(0, 20000)) : undefined;


export interface IssueSample {
    id: any;
    number: number;
    title: string;
    state: string;
    created_at: string;
    labels: { name: string }[];
    is_pull_request: boolean;
}

export function toIssueSample(row: any): IssueSample {
    return {
        id: row.id,
        number: row.number,
        title: row.title ?? "",
        state: row.state,
        created_at: row.created_at,
        labels: (row.labels ?? []).map((l: any) => ({ name: l.name })),
        is_pull_request: !!row.pull_request,
    };
}

export type PullSample = {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    merged_at: string | null;
    labels: { name: string }[];
};

export function toPullSample(row: any): PullSample {
    return {
        id: row.id,
        number: row.number,
        title: row.title ?? "",
        state: row.state,
        created_at: row.created_at,
        merged_at: row.merged_at ?? null,
        labels: (row.labels ?? []).map((l: any) => ({ name: l.name })),
    };
}


const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN = /\b(ghp|github_pat|ghs)_[A-Za-z0-9_]{20,}\b/gi;
const CODE_FENCE = /```[\s\S]*?```/g;

export function sanitizeBody(body?: string): { short: string; sha: string } {
    let t = (body ?? "");
    t = t.replace(CODE_FENCE, "[code_block]");
    t = t.replace(EMAIL, "[redacted-email]").replace(TOKEN, "[redacted-token]");
    t = t.slice(0, 4000).replace(/\s+/g, " ").trim();
    const sha = crypto.createHash("sha256").update(t).digest("hex");
    return { short: t, sha };
}