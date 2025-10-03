import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const SNAPSHOTS_DIR = "datasets/snapshots";

function findFiles(pattern: RegExp, dir = SNAPSHOTS_DIR): string[] {
    const results: string[] = [];
    function walk(d: string) {
        for (const f of fs.readdirSync(d)) {
            const full = path.join(d, f);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) walk(full);
            else if (pattern.test(full)) results.push(full);
        }
    }
    walk(dir);
    return results;
}

describe("Data snapshot & sample set", () => {
    it("has a manifest.yaml that parses", () => {
        const manifestPath = path.join(SNAPSHOTS_DIR, "manifest.yaml");
        expect(fs.existsSync(manifestPath)).toBe(true);
        const raw = fs.readFileSync(manifestPath, "utf8");
        const doc = YAML.parse(raw);
        expect(Array.isArray(doc.repos)).toBe(true);
    });

    it("does not commit raw/ files", () => {
        const raws = findFiles(/\/raw\//);
        expect(raws.length, `raw/ should be ignored in git, found: ${raws}`).toBe(0);
    });

    it("sample JSONL files are small (<=500 lines)", () => {
        const samples = findFiles(/sample\/.*\.jsonl$/);
        for (const s of samples) {
            const lines = fs.readFileSync(s, "utf8").trim().split(/\r?\n/).length;
            expect(lines, `${s} too large`).toBeLessThanOrEqual(500);
        }
    });

    it("balanced samples have matching stats.json", () => {
        const metas = findFiles(/meta\/stats\.json$/);
        expect(metas.length).toBeGreaterThan(0);
        for (const m of metas) {
            const stats = JSON.parse(fs.readFileSync(m, "utf8"));
            expect(stats).toHaveProperty("repo");
            expect(stats).toHaveProperty("sample_size");
            expect(stats.sample_size).toBeGreaterThan(0);
            expect(stats).toHaveProperty("per_label_counts");
            const counts = Object.values(stats.per_label_counts as Record<string, number>);
            expect(counts.some((n) => n >= stats.target_label_min)).toBe(true);
        }
    });
});
