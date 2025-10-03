import { describe, it, expect } from "vitest";
import fs from "node:fs";
import YAML from "yaml";

const rankedJsonCandidates = [
    "docs/selection/selacc_ranked.json",
    "artifacts/selection/selacc_ranked.json",
    // fallbacks:
    "docs/selection/ranked.json",
    "artifacts/selection/ranked.json",
];
const matrixCsvCandidates = [
    "docs/selection/selacc_matrix.csv",
    "artifacts/selection/selacc_matrix.csv",
    // fallbacks:
    "docs/selection/matrix.csv",
    "docs/selection/selection_matrix.csv",
];

function firstExisting(p: string[]) {
    for (const f of p) if (fs.existsSync(f)) return f;
    return null;
}

function parseCsv(raw: string) {
    const lines = raw.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map((s) => s.trim());
    const rows = lines.slice(1).map((ln) => {
        const cols = ln.split(",").map((s) => s.trim());
        const rec: any = {};
        headers.forEach((h, i) => (rec[h] = cols[i]));
        return rec;
    });
    return { headers, rows };
}

describe("SELACC – Repo selection artifacts", () => {
    it("has a ranked list (JSON) or selection matrix (CSV)", () => {
        const ranked = firstExisting(rankedJsonCandidates);
        const matrix = firstExisting(matrixCsvCandidates);
        expect(ranked || matrix, "Provide selacc_ranked.json or selacc_matrix.csv").toBeTruthy();

        if (ranked) {
            const arr = JSON.parse(fs.readFileSync(ranked, "utf8"));
            expect(Array.isArray(arr)).toBe(true);
            expect(arr.length).toBeGreaterThanOrEqual(2);
            for (const r of arr) {
                expect(typeof r.full_name).toBe("string");
                expect(typeof r.score).toBe("number");
                expect(r.score).toBeGreaterThanOrEqual(0);
                expect(r.score).toBeLessThanOrEqual(1);
            }
            const sorted = [...arr].sort((a, b) => b.score - a.score);
            expect(JSON.stringify(arr)).toBe(JSON.stringify(sorted));
        } else if (matrix) {
            const { headers, rows } = parseCsv(fs.readFileSync(matrix, "utf8"));
            const must = ["repo", "owner", "score"];
            must.forEach((h) =>
                expect(headers.includes(h), `CSV must include header '${h}'`).toBe(true)
            );
            expect(rows.length).toBeGreaterThanOrEqual(2);
            for (const r of rows) {
                const s = Number(r.score);
                expect(Number.isFinite(s)).toBe(true);
                expect(s).toBeGreaterThanOrEqual(0);
                expect(s).toBeLessThanOrEqual(1);
            }
        }
    });

    it("optionally validates selacc weights if present", () => {
        const weightsFileCandidates = [
            "docs/selection/selacc_weights.yaml",
            "docs/selection/weights.yaml", // fallback
        ];
        const f = firstExisting(weightsFileCandidates);
        if (!f) return; // optional

        const y = YAML.parse(fs.readFileSync(f, "utf8")) || {};
        const vals = Object.values(y).map(Number).filter(Number.isFinite) as number[];
        expect(vals.length).toBeGreaterThan(0);
        const sum = vals.reduce((a, b) => a + b, 0);
        expect(sum).toBeGreaterThan(0.9);
        expect(sum).toBeLessThanOrEqual(1.1);
    });
});
