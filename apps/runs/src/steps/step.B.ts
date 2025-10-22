import { z } from "zod";
import { ledger } from "../storage/ledger.js";
import type { RunJob } from "../queue/bullmq.js";

const PayloadB = z.object({
    run_id: z.string().uuid(),
    repo_id: z.string(),
});

export async function stepB(job: RunJob) {
    const data = PayloadB.parse(job.data);

    await ledger.emit(data.run_id, "b_start", { repo_id: data.repo_id });

    // TODO: real work here

    await ledger.emit(data.run_id, "b_done", {});
    // await ledger.markSucceeded?.(data.run_id);
}
