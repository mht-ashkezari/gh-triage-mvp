import { RunJob } from "../queue/bullmq";
import { ledger } from "../storage/ledger";

export async function stepB(job: RunJob) {
    await ledger.update(job.run_id, "running");
    await ledger.emit(job.run_id, "b_start", { repo_id: job.repo_id });
    await new Promise(r => setTimeout(r, 100));
    await ledger.emit(job.run_id, "b_done");
    await ledger.update(job.run_id, "succeeded");
}
