import * as dotenv from "dotenv";
import * as path from "node:path";
import crypto from "node:crypto";
import { Injectable } from "@nestjs/common";
import { createAppAuth } from "@octokit/auth-app";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

@Injectable()
export class GithubService {
    private webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "testsecret";
    private appId = process.env.GITHUB_APP_ID || "";
    private privateKey = Buffer.from(
        process.env.GITHUB_PRIVATE_KEY_BASE64 || "",
        "base64"
    ).toString("utf8");

    public installUrl(): string {
        const slug = process.env.GITHUB_APP_SLUG?.trim();
        if (!slug || /[<>]/.test(slug)) {
            throw new Error("GITHUB_APP_SLUG is not set correctly.");
        }
        const base = (process.env.GITHUB_BASE_URL || "https://github.com").replace(
            /\/+$/,
            ""
        );
        return `${base}/apps/${slug}/installations/new`;
    }

    verifyHmac(sig256: string | undefined, rawBody: string | Buffer) {
        if (!sig256?.startsWith("sha256=")) return false;
        const bodyBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
        const expected = crypto
            .createHmac("sha256", this.webhookSecret)
            .update(bodyBuf)
            .digest("hex");
        const provided = sig256.slice(7);
        if (expected.length !== provided.length) return false;
        return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
    }

    async getInstallationToken(installationId: number): Promise<string> {
        if (!this.appId || !this.privateKey) {
            throw new Error("GitHub App credentials not configured");
        }
        const appAuth = createAppAuth({
            appId: this.appId,
            privateKey: this.privateKey,
        });
        const res = await appAuth({ type: "installation", installationId });
        return (res as any).token;
    }

    async upsertInstallation(payload: any) {
        const inst = payload.installation;
        const acc = inst.account || payload.account;
        await pool.query(
            `insert into installations(installation_id,account_login,account_type,suspended)
       values($1,$2,$3,$4)
       on conflict (installation_id) do update set
         account_login=excluded.account_login,
         account_type=excluded.account_type,
         suspended=excluded.suspended`,
            [inst.id, acc?.login ?? "unknown", acc?.type ?? "Unknown", !!inst.suspended_at]
        );
    }

    async upsertRepos(installationId: number, repos: any[]) {
        const client = await pool.connect();
        try {
            await client.query("begin");
            for (const r of repos) {
                await client.query(
                    `insert into repos(installation_id,owner,name,private)
           values ($1,$2,$3,$4)
           on conflict (installation_id,owner,name)
           do update set private=excluded.private`,
                    [installationId, r.owner.login, r.name, !!r.private]
                );
            }
            await client.query("commit");
        } catch (e) {
            await client.query("rollback");
            throw e;
        } finally {
            client.release();
        }
    }

    async removeRepos(installationId: number, repos: any[]) {
        for (const r of repos) {
            await pool.query(
                `delete from repos where installation_id=$1 and owner=$2 and name=$3`,
                [installationId, r.owner.login, r.name]
            );
        }
    }

    async listInstallations() {
        const { rows } = await pool.query(
            `select installation_id,account_login,account_type,suspended
       from installations
       order by installation_id asc`
        );
        return rows;
    }

    async listRepos(installationId: number) {
        const { rows } = await pool.query(
            `select installation_id, owner, name, private
       from repos
       where installation_id=$1
       order by owner, name`,
            [installationId]
        );
        return rows;
    }
}
