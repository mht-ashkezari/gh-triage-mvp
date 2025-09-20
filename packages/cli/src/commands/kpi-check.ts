import fs from "node:fs";
import * as YAML from "yaml";
import { KpiSpec } from "@ghtriage/kpi-spec"; // ← no /src/spec

export async function main(args: string[]) {
  const file = args[0] || "docs/kpis.yaml";
  const raw = fs.readFileSync(file, "utf-8");
  const data = YAML.parse(raw);

  const parsed = KpiSpec.safeParse(data);
  if (!parsed.success) {
    console.error("KPI spec validation FAILED for", file);
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
  console.log(`KPI spec OK — ${parsed.data.kpis.length} KPIs validated (${file}).`);
}
