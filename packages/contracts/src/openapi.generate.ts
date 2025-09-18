import fs from "node:fs";
import { generateOpenApi } from "@ts-rest/open-api";
import { BffContract } from "./bff.contract.js";
import { RunsContract } from "./runs.contract.js";

fs.mkdirSync("docs/openapi", { recursive: true });

const bff = generateOpenApi(BffContract, { info: { title: "BFF API", version: "1.0.0" } });
fs.writeFileSync("docs/openapi/bff.openapi.json", JSON.stringify(bff, null, 2));

const runs = generateOpenApi(RunsContract, { info: { title: "Runs API", version: "1.0.0" } });
fs.writeFileSync("docs/openapi/runs.openapi.json", JSON.stringify(runs, null, 2));

console.log("OpenAPI specs written to docs/openapi");
