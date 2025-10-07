import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CriticalFactsV1, TriageCardV1, ReleaseNotesV1 } from "@ghtriage/schemas";

const c = initContract();

export const RunsContract = c.router({
    // producers
    runA: {
        method: "POST",
        path: "/runs/A",
        body: z.object({ repo_id: z.string(), since: z.string().optional() }),
        responses: { 202: z.object({ run_id: z.string() }) }
    },
    runB: {
        method: "POST",
        path: "/runs/B",
        body: z.object({ repo_id: z.string() }),
        responses: { 202: z.object({ run_id: z.string() }) }
    },
    runD: {
        method: "POST",
        path: "/runs/D",
        body: z.object({ repo_id: z.string(), tag: z.string().optional() }),
        responses: { 202: z.object({ run_id: z.string() }) }
    },

    // read-side helpers (used by BFF/clients)
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
