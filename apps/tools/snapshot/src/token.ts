import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export type AuthKind = "app" | "pat";

function hasAppEnv() {
    return Boolean(
        process.env.GITHUB_APP_ID &&
        process.env.GITHUB_INSTALLATION_ID &&
        process.env.GITHUB_PRIVATE_KEY_BASE64
    );
}

function readAppPrivateKey(): string {
    const v = process.env.GITHUB_PRIVATE_KEY_BASE64 || "";
    if (!v) throw new Error("Missing GITHUB_PRIVATE_KEY_BASE64");

    // If the env already looks like a PEM, accept it and unescape \n (dotenv/common CI patterns)
    if (v.includes("-----BEGIN") && v.includes("PRIVATE KEY-----")) {
        return v.replace(/\\n/g, "\n").trim();
    }

    // Otherwise assume it is base64 of the PEM
    const decoded = Buffer.from(v, "base64").toString("utf8").trim();

    // Fail fast if decoding didn’t yield a PEM
    if (!decoded.includes("-----BEGIN") || !decoded.includes("PRIVATE KEY-----")) {
        throw new Error(
            "GITHUB_PRIVATE_KEY_BASE64 did not decode to a PEM. " +
            "Provide either the raw PEM (with \\n) or base64 of the PEM."
        );
    }
    return decoded;
}


export async function makeOctokitFromEnv(): Promise<{
    octo: Octokit;
    kind: AuthKind;
    who: string;
}> {
    if (hasAppEnv()) {
        const appId = Number(process.env.GITHUB_APP_ID);
        const installationId = Number(process.env.GITHUB_INSTALLATION_ID);
        const privateKey = readAppPrivateKey();

        const octo = new Octokit({
            authStrategy: createAppAuth,
            auth: { appId, privateKey, installationId },
        });

        // NOTE: installation tokens don't support GET /user.
        // Keep logging simple and offline:
        const who = `app#${appId} installation#${installationId}`;
        return { octo, kind: "app", who };
    }

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
        const octo = new Octokit({ auth: token });
        let who = "token";
        try {
            const me = await octo.users.getAuthenticated();
            who = me.data.login;
        } catch {
            // fine (some tokens can't call /user)
        }
        return { octo, kind: "pat", who };
    }

    throw new Error(
        "No auth configured. Provide GitHub App env (GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_PRIVATE_KEY_BASE64) or GITHUB_TOKEN."
    );
}
