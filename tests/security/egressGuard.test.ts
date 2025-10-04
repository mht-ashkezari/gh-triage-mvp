import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { egressGuard } from "../../apps/bff/src/middleware/egressGuard";

process.env.ALLOWED_EGRESS_HOSTS = "api.github.com";

const app = express();

// apply middleware globally so headers reach it
app.use(egressGuard);

app.get("/", (_req, res) => res.json({ ok: true }));


describe("egressGuard", () => {
    it("allows allowed hosts", async () => {
        const res = await request(app)
            .get("/")
            .set("x-target-host", "api.github.com");
        expect(res.status).toBe(200);
    });
});
