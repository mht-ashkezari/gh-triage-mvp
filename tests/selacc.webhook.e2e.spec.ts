// @ts-nocheck

import { describe, it, beforeAll } from "vitest";

function has(mod: string) { try { require.resolve(mod); return true; } catch { return false; } }
const HAS_NEST = has("@nestjs/testing");
const _describe = HAS_NEST ? describe : describe.skip;

_describe("SELACC – GitHub webhook HMAC (optional e2e)", async () => {
    let app: any;

    beforeAll(async () => {
        const { Test } = await import("@nestjs/testing");
        const modulePath =
            process.env.SELACC_APP_MODULE_PATH ||
            process.env.P02_APP_MODULE_PATH || // legacy env name (fallback)
            "apps/bff/src/app.module";
        const AppModule = (await import(modulePath as string)).AppModule;
        const m = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = m.createNestApplication();
        await app.init();
    });

    it("rejects bad signature with 401", async () => {
        const request = (await import("supertest")).default;
        await request(app.getHttpServer())
            .post("/webhooks/github")
            .set("x-hub-signature-256", "sha256=deadbeef")
            .set("x-github-event", "ping")
            .send({ action: "ping" })
            .expect(401);
    });

    it("accepts valid signature", async () => {
        const request = (await import("supertest")).default;
        const crypto = await import("node:crypto");
        const secret = process.env.GITHUB_WEBHOOK_SECRET || "testsecret";
        const body = JSON.stringify({ action: "installation", installation: { id: 999 } });
        const sig = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
        await request(app.getHttpServer())
            .post("/webhooks/github")
            .set("x-hub-signature-256", sig)
            .set("x-github-event", "installation")
            .send(JSON.parse(body))
            .expect(200);
    });
});
