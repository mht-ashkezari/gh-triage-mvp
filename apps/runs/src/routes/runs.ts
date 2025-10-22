import type { Router as RouterType } from "express";
import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { ledger } from "../storage/ledger.js";
import { enqueue } from "../queue/bullmq.js";

const router: RouterType = Router();

const BodyA = z.object({ repo_id: z.string(), since: z.string().optional() });
const BodyB = z.object({ repo_id: z.string() });
const BodyD = z.object({ repo_id: z.string(), tag: z.string().optional() });

router.post("/A", async (req, res, next) => {
    try {
        const { repo_id, since } = BodyA.parse(req.body);
        const run_id = randomUUID();
        await ledger.createRun({ run_id, repo_id, step: "A" });
        await ledger.emit(run_id, "enqueued", { step: "A", repo_id, since: since ?? null });
        await enqueue("A", { run_id, repo_id, since: since ?? null });
        res.status(202).json({ run_id });
    } catch (e) {
        next(e);
    }
});

router.post("/B", async (req, res, next) => {
    try {
        const { repo_id } = BodyB.parse(req.body);
        const run_id = randomUUID();
        await ledger.createRun({ run_id, repo_id, step: "B" });
        await ledger.emit(run_id, "enqueued", { step: "B", repo_id });
        await enqueue("B", { run_id, repo_id });
        res.status(202).json({ run_id });
    } catch (e) {
        next(e);
    }
});

router.post("/D", async (req, res, next) => {
    try {
        const { repo_id, tag } = BodyD.parse(req.body);
        const run_id = randomUUID();
        await ledger.createRun({ run_id, repo_id, step: "D" });
        await ledger.emit(run_id, "enqueued", { step: "D", repo_id, tag: tag ?? null });
        await enqueue("D", { run_id, repo_id, tag: tag ?? null });
        res.status(202).json({ run_id });
    } catch (e) {
        next(e);
    }
});

export default router;
