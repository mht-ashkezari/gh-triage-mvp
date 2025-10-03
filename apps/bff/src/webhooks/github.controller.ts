import { Controller, Post, Headers, Req, UnauthorizedException, HttpCode } from "@nestjs/common";
import type { Request } from "express";
import crypto from "node:crypto";

function verifyHmac(secret: string, body: unknown, sigHeader?: string): boolean {
    if (!sigHeader || !sigHeader.startsWith("sha256=")) return false;
    const candidate = sigHeader.slice("sha256=".length);

    const payload = JSON.stringify(body); // OK for tests; for real GitHub use raw body bytes.
    const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const a = Buffer.from(candidate);
    const b = Buffer.from(computed);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

@Controller("webhooks")
export class GithubWebhookController {
    @Post("github")
    @HttpCode(200) // ← force 200 OK instead of Nest's default 201
    handle(@Req() req: Request, @Headers("x-hub-signature-256") sig?: string) {
        const secret = process.env.GITHUB_WEBHOOK_SECRET || "testsecret";
        const ok = verifyHmac(secret, req.body, sig);
        if (!ok) throw new UnauthorizedException("bad signature");
        return { ok: true };
    }
}