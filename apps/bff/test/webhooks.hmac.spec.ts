import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import { GithubService } from "../src/github/github.service";

describe("HMAC verify", () => {
    const svc = new (GithubService as any)();
    // Use the CI secret or a sensible default
    (svc as any).webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "testsecret";

    it("accepts valid sha256 signature", () => {
        const body = '{"ok":true}';
        const secret = (svc as any).webhookSecret as string;
        const hex = crypto.createHmac("sha256", secret).update(body).digest("hex");
        expect(svc.verifyHmac("sha256=" + hex, body)).toBe(true);
    });

    it("rejects missing/invalid signature", () => {
        expect(svc.verifyHmac(undefined as any, "{}")).toBe(false);
        expect(svc.verifyHmac("sha256=deadbeef", "{}")).toBe(false);
    });
});
