import * as fs from "node:fs";
import * as path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { KpiSpec } from "../packages/kpi-spec/src/spec";

const outDir = path.join(process.cwd(), "packages", "schemas");
fs.mkdirSync(outDir, { recursive: true });

const json = zodToJsonSchema(KpiSpec, "KpiSpec");
const outPath = path.join(outDir, "kpis.schema.json");

fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
console.log("Wrote", outPath);
