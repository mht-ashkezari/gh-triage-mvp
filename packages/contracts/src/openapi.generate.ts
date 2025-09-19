import fs from "node:fs";
import path from "node:path";
import { generateOpenApi } from "@ts-rest/open-api";
import { BffContract } from "./bff.contract.js";
import { RunsContract } from "./runs.contract.js";

// Write OpenAPI files to the repo-level docs/openapi/
const outDir = path.resolve(process.cwd(), "../../docs/openapi");
fs.mkdirSync(outDir, { recursive: true });

const bff = generateOpenApi(BffContract, { info: { title: "BFF API", version: "1.0.0" } });
fs.writeFileSync(path.join(outDir, "bff.openapi.json"), JSON.stringify(bff, null, 2));

const runs = generateOpenApi(RunsContract, { info: { title: "Runs API", version: "1.0.0" } });
fs.writeFileSync(path.join(outDir, "runs.openapi.json"), JSON.stringify(runs, null, 2));

console.log(`OpenAPI specs written to ${outDir}`);