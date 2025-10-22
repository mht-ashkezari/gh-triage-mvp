import { z } from "zod";
import { ledger } from "../storage/ledger.js";
import type { RunJob } from "../queue/bullmq.js";

const PayloadD = z.object({
    run_id: z.string().uuid(),
    repo_id: z.string(),
    tag: z.string().nullable().optional(),
});

export async function stepD(job: RunJob) {
    const data = PayloadD.parse(job.data);

    await ledger.emit(data.run_id, "d_start", {
        repo_id: data.repo_id,
        tag: data.tag ?? null,
    });

    // TODO: real work here

    await ledger.emit(data.run_id, "d_done", {});
}
