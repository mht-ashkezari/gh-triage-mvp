import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CriticalFactsV1, TriageCardV1, ReleaseNotesV1 } from "@ghtriage/schemas";

const c = initContract();

export const BffContract = c.router({
    health: {
        method: "GET",
        path: "/health",
        responses: { 200: z.object({ ok: z.literal(true), svc: z.literal("bff") }) }
    },
    getFacts: {
        method: "GET",
        path: "/repos/:id/facts/:issue",
        pathParams: z.object({ id: z.string(), issue: z.number().int() }),
        responses: { 200: CriticalFactsV1 }
    },
    getTriage: {
        method: "GET",
        path: "/repos/:id/triage",
        pathParams: z.object({ id: z.string() }),
        responses: { 200: z.array(TriageCardV1) }
    },
    getReleaseDraft: {
        method: "GET",
        path: "/repos/:id/release/draft",
        pathParams: z.object({ id: z.string() }),
        responses: { 200: ReleaseNotesV1 }
    }
});
