"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunsContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
/**
 * Long-running pipeline invocations.
 */
exports.RunsContract = c.router({
    runA: {
        method: "POST",
        path: "/runs/A",
        body: zod_1.z.object({ repo_id: zod_1.z.string() }),
        responses: { 202: zod_1.z.object({ run_id: zod_1.z.string() }) }
    },
    runD: {
        method: "POST",
        path: "/runs/D",
        body: zod_1.z.object({ repo_id: zod_1.z.string(), tag: zod_1.z.string().optional() }),
        responses: { 202: zod_1.z.object({ run_id: zod_1.z.string() }) }
    }
});
