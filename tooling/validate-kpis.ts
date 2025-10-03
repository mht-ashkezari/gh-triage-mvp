#!/usr/bin/env tsx
/**
 * KPI spec validator for P0.1
 * - Validates docs/kpis.yaml against packages/schemas/kpis.schema.json (draft-07)
 * - Enforces extra project rules (required keys, uniqueness, alerting present)
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import Ajv from "ajv";

type AnyObj = Record<string, any>;
const REQUIRED_KEYS = ["json_validity_rate", "label_f1", "release_edit_rate"];

function read(file: string): AnyObj {
    const raw = fs.readFileSync(file, "utf8");
    return file.endsWith(".yaml") || file.endsWith(".yml") ? (YAML.parse(raw) as AnyObj) : (JSON.parse(raw) as AnyObj);
}

function fail(msg: string, errs?: unknown): never {
    console.error("❌", msg);
    if (errs) {
        console.error(typeof errs === "string" ? errs : JSON.stringify(errs, null, 2));
    }
    process.exit(2);
}

function parseTarget(t: string) {
    // e.g. ">= 0.98"
    const m = t.trim().match(/^(>=|<=|==|>|<)\s*([-+]?\d+(?:\.\d+)?)$/);
    if (!m) return null;
    return { op: m[1], value: Number(m[2]) };
}

async function main() {
    const kpiPath = process.argv[2] ?? "docs/kpis.yaml";
    const schemaPath = process.argv[3] ?? "packages/schemas/kpis.schema.json";

    const spec = read(path.resolve(kpiPath));
    const schema = read(path.resolve(schemaPath));

    // JSON Schema (draft-07 default)
    const ajv = new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    const ok = validate(spec);
    if (!ok) fail("Schema validation failed", validate.errors);

    if (!Array.isArray(spec.kpis) || spec.kpis.length === 0) {
        fail("No KPIs found in spec.");
    }

    // Extra project rules (non-schema)
    const keys = spec.kpis.map((k: AnyObj) => k.key);
    // 1) must include charter KPIs
    const missing = REQUIRED_KEYS.filter((k) => !keys.includes(k));
    if (missing.length) fail(`Missing required KPI(s): ${missing.join(", ")}`);

    // 2) keys must be unique
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dup.length) fail(`Duplicate KPI key(s): ${Array.from(new Set(dup)).join(", ")}`);

    // 3) each KPI should include alerting (repo convention)
    const noAlert = (spec.kpis as AnyObj[]).filter((k) => !k.alerting);
    if (noAlert.length) {
        fail(
            `All KPIs must define 'alerting'. Missing in: ${noAlert.map((k) => k.key).join(", ")}`
        );
    }

    // 4) sanity: target syntax & minimal direction/alert alignment
    const badTargets: string[] = [];
    const misAligned: string[] = [];
    for (const k of spec.kpis as AnyObj[]) {
        const p = parseTarget(k.target);
        if (!p) {
            badTargets.push(k.key);
            continue;
        }
        const a = k.alerting ?? {};
        // If target is "<=" or "<" we expect warn_above to be present.
        if ((p.op === "<=" || p.op === "<") && typeof a.warn_above !== "number") {
            misAligned.push(`${k.key} (target ${k.target} needs alerting.warn_above)`);
        }
        // If target is ">=" or ">" we expect warn_below to be present.
        if ((p.op === ">=" || p.op === ">") && typeof a.warn_below !== "number") {
            misAligned.push(`${k.key} (target ${k.target} needs alerting.warn_below)`);
        }
    }
    if (badTargets.length) fail(`Invalid target format for: ${badTargets.join(", ")}`);
    if (misAligned.length) fail(`Alerting misalignment:\n- ${misAligned.join("\n- ")}`);

    console.log(`✅ KPI spec OK: ${kpiPath}`);
    console.log(`   KPIs: ${keys.join(", ")}`);
}

main();
