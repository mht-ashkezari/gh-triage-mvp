import fs from "node:fs";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { KpiSpec } from "@ghtriage/kpi-spec"; // ← no /src/spec

export async function main(args: string[]) {
    const out = args[0] || "packages/schemas/kpis.schema.json";
    const outDir = path.dirname(out);
    fs.mkdirSync(outDir, { recursive: true });

    const json = zodToJsonSchema(KpiSpec, "KpiSpec");
    fs.writeFileSync(out, JSON.stringify(json, null, 2));
    console.log("Wrote", out);
}
