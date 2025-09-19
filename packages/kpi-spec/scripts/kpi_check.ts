import * as fs from "node:fs";
import * as YAML from "yaml";
import { KpiSpec } from "../packages/kpi-spec/src/spec";

const file = process.argv[2] || "docs/kpis.yaml";
const raw = fs.readFileSync(file, "utf-8");
const data = YAML.parse(raw);

const parsed = KpiSpec.safeParse(data);
if (!parsed.success) {
    console.error("KPI spec validation FAILED for", file);
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
console.log(`KPI spec OK — ${parsed.data.kpis.length} KPIs validated (${file}).`);
