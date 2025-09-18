import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const RunsContract = c.router({
    runA: {
        method: "POST",
        path: "/runs/A",
        body: z.object({ repo_id: z.string() }),
        responses: { 202: z.object({ run_id: z.string() }) }
    },
    runD: {
        method: "POST",
        path: "/runs/D",
        body: z.object({ repo_id: z.string(), tag: z.string().optional() }),
        responses: { 202: z.object({ run_id: z.string() }) }
    }
});

