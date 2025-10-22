import { z } from "zod";
import { ledger } from "../storage/ledger.js";
import type { RunJob } from "../queue/bullmq.js";

const PayloadA = z.object({
    run_id: z.string().uuid(),
    repo_id: z.string(),
    since: z.string().nullable().optional(),
});

export async function stepA(job: RunJob) {
    const data = PayloadA.parse(job.data);

    await ledger.emit(data.run_id, "a_start", {
        repo_id: data.repo_id,
        since: data.since ?? null,
    });

    // TODO: real work here

    await ledger.emit(data.run_id, "a_done", {});
    // If you later add a helper to flip run status → succeeded:
    // await ledger.markSucceeded?.(data.run_id);
}
