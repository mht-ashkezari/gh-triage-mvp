import { createWorker } from "./queue/bullmq.js";
import type { Worker } from "bullmq";

let worker: Worker | null = null;

export async function startWorker() {
    const w = createWorker();
    worker = w;
    w.on("completed", (job) => console.log(`[runs] job ${job.id} completed (${job.name})`));
    w.on("failed", (job, err) => console.error(`[runs] job ${job?.id} failed (${job?.name}):`, err?.message));
}

export async function stopWorker() {
    if (worker) {
        await worker.close();
        await worker.disconnect();
        worker = null;
    }
}
