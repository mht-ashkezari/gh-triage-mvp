import fs from "node:fs";
import path from "node:path";
import { type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { entities, common } from "@ghtriage/schemas";

const outDir = path.resolve(process.cwd(), "../../docs/jsonschema");
fs.mkdirSync(outDir, { recursive: true });

const isZodSchema = (v: unknown): v is ZodTypeAny =>
  !!v && typeof v === "object" && "_def" in (v as any);

const candidates: Record<string, unknown> = { ...entities, ...common };
let count = 0;

for (const [name, maybeSchema] of Object.entries(candidates)) {
  if (!isZodSchema(maybeSchema)) continue;
  const json = zodToJsonSchema(maybeSchema, name);
  fs.writeFileSync(path.join(outDir, `${name}.schema.json`), JSON.stringify(json, null, 2));
  count++;
}
console.log(`[jsonschema] wrote ${count} schema file(s) to ${outDir}`);
