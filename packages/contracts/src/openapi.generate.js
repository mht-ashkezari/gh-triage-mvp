"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const open_api_1 = require("@ts-rest/open-api");
const bff_contract_1 = require("./bff.contract");
const runs_contract_1 = require("./runs.contract");
node_fs_1.default.mkdirSync("docs/openapi", { recursive: true });
const bff = (0, open_api_1.generateOpenApi)(bff_contract_1.BffContract, {
    info: { title: "BFF API", version: "1.0.0" }
});
node_fs_1.default.writeFileSync("docs/openapi/bff.openapi.json", JSON.stringify(bff, null, 2));
const runs = (0, open_api_1.generateOpenApi)(runs_contract_1.RunsContract, {
    info: { title: "Runs API", version: "1.0.0" }
});
node_fs_1.default.writeFileSync("docs/openapi/runs.openapi.json", JSON.stringify(runs, null, 2));
console.log("OpenAPI specs written to docs/openapi");
