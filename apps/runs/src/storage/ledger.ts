import { Pool } from "pg";

const DEFAULT_DBURL = "postgresql://postgres:postgres@127.0.0.1:5432/ghtriage";
const DBURL = process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    ? process.env.DATABASE_URL
    : DEFAULT_DBURL;

export const ledger = {
    pool: new Pool({ connectionString: DBURL }),

    async createRun(p: { run_id: string; repo_id: string; step: "A" | "B" | "D" }) {
        await this.pool.query(
            `insert into runs (run_id, repo_id, step, status) values ($1,$2,$3,'queued') on conflict do nothing`,
            [p.run_id, p.repo_id, p.step]
        );
    },

    async update(run_id: string, status: "queued" | "running" | "succeeded" | "failed" | "canceled", extra: Record<string, unknown> = {}) {
        const sets = ["status = $2"];
        const vals: any[] = [run_id, status];
        let i = 3;
        for (const [k, v] of Object.entries(extra)) { sets.push(`${k} = $${i++}`); vals.push(v); }
        if (status === "running") sets.push(`started_at = now()`);
        if (["succeeded", "failed", "canceled"].includes(status)) sets.push(`finished_at = now()`);
        await this.pool.query(`update runs set ${sets.join(", ")} where run_id = $1`, vals);
    },

    async emit(run_id: string, code: string, data?: unknown) {
        await this.pool.query(`insert into run_events (run_id, code, data) values ($1,$2,$3)`, [run_id, code, data ?? null]);
    }
};
