import { Queue, Worker, JobsOptions, Job, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { ledger } from "../storage/ledger";
import { stepA } from "../steps/step.A";
import { stepB } from "../steps/step.B";
import { stepD } from "../steps/step.D";

export type Step = "A" | "B" | "D";
export type RunJob = { run_id: string; step: Step; repo_id: string; since?: string | null; tag?: string | null };

const redis = (() => {
    const common = { maxRetriesPerRequest: null as any, enableReadyCheck: true };
    const url = process.env.REDIS_URL;
    if (url) return new IORedis(url, common as any);
    return new IORedis({
        host: process.env.REDIS_HOST ?? "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
        ...common
    } as any);
})();

const QUEUE = "runs";
export const queue = new Queue<RunJob>(QUEUE, { connection: redis });
export const events = new QueueEvents(QUEUE, { connection: redis });

export async function enqueue(job: RunJob, opts: JobsOptions = {}) {
    return queue.add(job.step, job, {
        jobId: job.run_id,        // idempotency per run_id
        removeOnComplete: 500,
        removeOnFail: 500,
        attempts: 3,
        backoff: { type: "exponential", delay: 500 },
        ...opts
    });
}

// worker
export function createWorker() {
    const concurrency = parseInt(process.env.RUNS_CONCURRENCY ?? "4", 10);
    const worker = new Worker<RunJob>(QUEUE, async (job: Job<RunJob>) => {
        const { run_id, step } = job.data;
        try {
            switch (step) {
                case "A": await stepA(job.data); break;
                case "B": await stepB(job.data); break;
                case "D": await stepD(job.data); break;
                default: throw new Error(`Unknown step: ${step}`);
            }
        } catch (e: any) {
            await ledger.update(run_id, "failed", { error_message: String(e?.message ?? e) });
            await ledger.emit(run_id, "error", { stack: String(e?.stack ?? e) });
            throw e;
        }
    }, { connection: redis, concurrency });

    return worker;
}
