import fs from "node:fs";
import { z, type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as entities from "@ghtriage/schemas/src/entities.js";
import * as common from "@ghtriage/schemas/src/common.js";

fs.mkdirSync("docs/jsonschema", { recursive: true });

/** Type guard: is this value a Zod schema instance? */
const isZodSchema = (v: unknown): v is ZodTypeAny =>
  !!v && typeof v === "object" && "_def" in (v as any);

/** Choose what to export; skip helpers (functions, constants, etc.) */
const candidates: Record<string, unknown> = { ...entities, ...common };

let count = 0;
for (const [name, maybeSchema] of Object.entries(candidates)) {
  if (!isZodSchema(maybeSchema)) {
    console.warn(`[jsonschema] skip non-schema export: ${name}`);
    continue;
  }
  const json = zodToJsonSchema(maybeSchema, name);
  fs.writeFileSync(
    `docs/jsonschema/${name}.schema.json`,
    JSON.stringify(json, null, 2)
  );
  count++;
}
console.log(`[jsonschema] wrote ${count} schema file(s) to docs/jsonschema`);
