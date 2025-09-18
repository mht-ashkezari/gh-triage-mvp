"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BffContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const entities_1 = require("@ghtriage/schemas/src/entities");
const c = (0, core_1.initContract)();
/**
 * BFF public API contract.
 */
exports.BffContract = c.router({
    health: {
        method: "GET",
        path: "/health",
        responses: { 200: zod_1.z.object({ ok: zod_1.z.literal(true), svc: zod_1.z.literal("bff") }) }
    },
    getFacts: {
        method: "GET",
        path: "/repos/:id/facts/:issue",
        pathParams: zod_1.z.object({ id: zod_1.z.string(), issue: zod_1.z.number().int() }),
        responses: { 200: entities_1.CriticalFactsV1 }
    },
    getTriage: {
        method: "GET",
        path: "/repos/:id/triage",
        pathParams: zod_1.z.object({ id: zod_1.z.string() }),
        responses: { 200: zod_1.z.array(entities_1.TriageCardV1) }
    },
    getReleaseDraft: {
        method: "GET",
        path: "/repos/:id/release/draft",
        pathParams: zod_1.z.object({ id: zod_1.z.string() }),
        responses: { 200: entities_1.ReleaseNotesV1 }
    }
});
