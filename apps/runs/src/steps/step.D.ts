import { RunJob } from "../queue/bullmq";
import { ledger } from "../storage/ledger";

export async function stepD(job: RunJob) {
    await ledger.update(job.run_id, "running");
    await ledger.emit(job.run_id, "d_start", { repo_id: job.repo_id, tag: job.tag ?? null });
    await new Promise(r => setTimeout(r, 80));
    await ledger.emit(job.run_id, "d_done");
    await ledger.update(job.run_id, "succeeded");
}
