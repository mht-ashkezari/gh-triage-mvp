import { describe, it, beforeAll, afterAll, expect } from "vitest";

describe("SELACC – GitHub webhook HMAC (e2e)", () => {
    let app: any;
    let server: any;

    beforeAll(async () => {
        // Load Nest testing utils at runtime (ESM-friendly)
        const { Test } = await import("@nestjs/testing");

        // Allow overriding AppModule location from CI
        const modulePath =
            process.env.SELACC_APP_MODULE_PATH || "apps/bff/src/app.module";

        const { AppModule } = await import(modulePath as string);
        const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = modRef.createNestApplication();
        await app.init();
        server = app.getHttpServer();
    });

    afterAll(async () => {
        if (app?.close) await app.close();
    });

    it("rejects bad signature with 401", async () => {
        const request = (await import("supertest")).default;
        await request(server)
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

        // include minimal fields used by your service (installation + account)
        const body = JSON.stringify({
            action: "installation",
            installation: { id: 999, suspended_at: null },
            account: { login: "ci-bot", type: "User" },
        });

        const sig = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

        await request(server)
            .post("/webhooks/github")
            .set("x-hub-signature-256", sig)
            .set("x-github-event", "installation")
            .send(JSON.parse(body))
            .expect(200);
    });
});