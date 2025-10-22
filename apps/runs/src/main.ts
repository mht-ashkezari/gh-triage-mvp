import "dotenv/config";
import http from "node:http";
import express from "express";
import bodyParser from "body-parser";
import runsRouter from "./routes/runs.js";               // ← add .js
import { startWorker, stopWorker } from "./worker.js";   // ← add .js

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, svc: "runs" }));
app.use("/runs", runsRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.status || 500;
    res.status(status).json({ error: String(err?.message || err), status });
});

const port = parseInt(process.env.RUNS_PORT ?? "4101", 10);
const host = process.env.RUNS_HOST ?? "127.0.0.1";       // ← bind host explicitly

let server: http.Server;

server = app.listen(port, host, () => {
    console.log(`[runs] listening on ${host}:${port}`);
});

// Start worker
startWorker().catch((e: unknown) => {                    // ← type e
    console.error("[runs] worker failed:", e);
    process.exit(1);
});

function shutdown(signal: string) {
    console.log(`[runs] ${signal} received, shutting down...`);
    Promise.resolve()
        .then(() => stopWorker?.())
        .then(
            () =>
                new Promise<void>((res) => {
                    server.close(() => res());
                })
        )
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("[runs] shutdown error:", e);
            process.exit(1);
        });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
