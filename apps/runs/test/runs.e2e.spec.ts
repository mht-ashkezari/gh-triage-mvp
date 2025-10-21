import { describe, it, expect } from "vitest";

const base = process.env.RUNS_URL ?? "http://localhost:4101";

async function post(path: string, body: any) {
    const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
}

describe("runs e2e", () => {
    it("health responds ok", async () => {
        const r = await fetch(`${base}/health`);
        const j = await r.json();
        expect(j.ok).toBe(true);
        expect(j.svc).toBe("runs");
    });

    it("A: returns 202 and run_id", { timeout: 20_000 }, async () => {
        const { status, json } = await post("/runs/A", { repo_id: "microsoft/vscode", since: "2024-01-01" });
        expect(status).toBe(202);
        expect(typeof json.run_id).toBe("string");
    });

    it("B: returns 202 and run_id", { timeout: 20_000 }, async () => {
        const { status, json } = await post("/runs/B", { repo_id: "octocat/hello" });
        expect(status).toBe(202);
        expect(typeof json.run_id).toBe("string");
    });

    it("D: returns 202 and run_id", { timeout: 20_000 }, async () => {
        const { status, json } = await post("/runs/D", { repo_id: "octocat/hello", tag: "weekly" });
        expect(status).toBe(202);
        expect(typeof json.run_id).toBe("string");
    });
});
