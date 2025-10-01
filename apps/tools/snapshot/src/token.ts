// apps/tools/snapshot/src/token.ts
import { Octokit } from "@octokit/rest";
import { App } from "@octokit/app";

export async function getAuthOctokit(): Promise<Octokit> {
    const pat = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (pat) {
        return new Octokit({ auth: pat, userAgent: "gh-triage-snapshot" });
    }

    const appId = process.env.GITHUB_APP_ID;
    const pkB64 = process.env.GITHUB_PRIVATE_KEY_BASE64;
    const instId = process.env.GITHUB_INSTALLATION_ID;
    if (appId && pkB64 && instId) {
        const privateKey = Buffer.from(pkB64, "base64").toString("utf8");
        const app = new App({ appId, privateKey });
        const octo = await app.getInstallationOctokit(Number(instId));
        // The installation client is Octokit-compatible for our usage
        return octo as unknown as Octokit;
    }

    // Unauth fallback (low limits, OK for public endpoints)
    return new Octokit({ userAgent: "gh-triage-snapshot" });
}
