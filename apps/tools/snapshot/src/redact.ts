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