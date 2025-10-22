import * as IORedis from "ioredis";
import { Queue, Worker, type Job } from "bullmq";
import { stepA } from "../steps/step.A.js";
import { stepB } from "../steps/step.B.js";
import { stepD } from "../steps/step.D.js";

// Export job type so steps can: `import type { RunJob } from "../queue/bullmq.js"`
export type RunJob<T = any> = Job<T>;

function makeRedis() {
    // Handle both default & namespace exports across envs/typings
    const RedisCtor: any = (IORedis as any).default ?? (IORedis as any);

    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST ?? "127.0.0.1";
    const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);

    // BullMQ-friendly defaults for local/dev
    const common = {
        maxRetriesPerRequest: null as any,
        enableReadyCheck: false,
    };

    return url
        ? new RedisCtor(url, common as any)
        : new RedisCtor({ host, port, ...common } as any);
}

// Shared connection for queue & worker
const connection = makeRedis();

// Queue
export const queue = new Queue("runs", { connection });

// Names of supported jobs
type RunName = "A" | "B" | "D";

// Helper used by routes to enqueue work
export async function enqueue(name: RunName, payload: any) {
    return queue.add(name, payload, {
        removeOnComplete: true,
        removeOnFail: 100,
    });
}

// Worker
export function createWorker() {
    const concurrency = parseInt(process.env.RUNS_CONCURRENCY ?? "4", 10);

    return new Worker(
        "runs",
        async (job) => {
            if (job.name === "A") return stepA(job as any);
            if (job.name === "B") return stepB(job as any);
            if (job.name === "D") return stepD(job as any);
            throw new Error(`Unknown job: ${job.name}`);
        },
        { connection, concurrency }
    );
}
