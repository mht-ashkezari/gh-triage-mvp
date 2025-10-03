import { describe, it, expect } from "vitest";
import fs from "node:fs";
import YAML from "yaml";
import Ajv from "ajv";

const schema = JSON.parse(fs.readFileSync("packages/schemas/kpis.schema.json", "utf8"));
const doc = YAML.parse(fs.readFileSync("docs/kpis.yaml", "utf8"));

function parseTarget(t: string) {
    const m = t.trim().match(/^(>=|<=|==|>|<)\s*([-+]?\d+(?:\.\d+)?)$/);
    return m ? { op: m[1], value: Number(m[2]) } : null;
}

describe("P0.1 KPIs", () => {
    it("conform to JSON schema (draft-07)", () => {
        const ajv = new Ajv({ allErrors: true, strict: true });
        const v = ajv.compile(schema);
        const ok = v(doc);
        if (!ok) throw new Error(JSON.stringify(v.errors, null, 2));
        expect(ok).toBe(true);
    });

    it("include required charter KPIs", () => {
        const keys = new Set(doc.kpis.map((k: any) => k.key));
        ["json_validity_rate", "label_f1", "release_edit_rate"].forEach((k) =>
            expect(keys.has(k)).toBe(true)
        );
    });

    it("have unique keys", () => {
        const keys: string[] = doc.kpis.map((k: any) => k.key);
        const uniq = new Set(keys);
        expect(uniq.size).toBe(keys.length);
    });

    it("have alerting aligned with target direction", () => {
        for (const k of doc.kpis) {
            const p = parseTarget(k.target);
            expect(p).toBeTruthy();
            const a = k.alerting ?? {};
            if (p!.op === "<=" || p!.op === "<") {
                expect(typeof a.warn_above).toBe("number");
            }
            if (p!.op === ">=" || p!.op === ">") {
                expect(typeof a.warn_below).toBe("number");
            }
        }
    });
});
