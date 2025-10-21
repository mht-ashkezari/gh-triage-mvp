import { RunJob } from "../queue/bullmq";
import { ledger } from "../storage/ledger";

export async function stepA(job: RunJob) {
    await ledger.update(job.run_id, "running");
    await ledger.emit(job.run_id, "a_start", { repo_id: job.repo_id, since: job.since ?? null });
    // TODO (future): GitHub fetch + persist snapshot
    await new Promise(r => setTimeout(r, 120));
    await ledger.emit(job.run_id, "a_done");
    await ledger.update(job.run_id, "succeeded");
}
