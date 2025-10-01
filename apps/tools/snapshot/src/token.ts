import { Octokit as OctokitBase } from "@octokit/rest";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";

const Octokit = OctokitBase.plugin(retry, throttling);

export async function getAuthOctokit() {
    const pat = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    const common = {
        userAgent: "gh-triage-snapshot",
        // Retry 5xx and network errors automatically
        request: { retries: 5, retryAfter: 2 },
        throttle: {
            onRateLimit: (retryAfter: number, options: any) => {
                console.warn(`[rate-limit] ${options.method} ${options.url} → retry in ${retryAfter}s`);
                return true; // retry once
            },
            onSecondaryRateLimit: (retryAfter: number, options: any) => {
                console.warn(`[abuse-limit] ${options.method} ${options.url} → retry in ${retryAfter}s`);
                return true; // retry once
            },
        },
    } as const;

    if (pat) return new Octokit({ auth: pat, ...common });

    const { GITHUB_APP_ID, GITHUB_PRIVATE_KEY_BASE64, GITHUB_INSTALLATION_ID } = process.env;
    if (GITHUB_APP_ID && GITHUB_PRIVATE_KEY_BASE64 && GITHUB_INSTALLATION_ID) {
        // Lazy import to avoid the dependency unless we actually use App auth
        const { App } = await import("@octokit/app");
        const privateKey = Buffer.from(GITHUB_PRIVATE_KEY_BASE64, "base64").toString("utf8");
        const app = new App({ appId: GITHUB_APP_ID, privateKey });
        const installationOcto = (await app.getInstallationOctokit(Number(GITHUB_INSTALLATION_ID))) as any;

        // Wrap the installation client to attach retry/throttle behavior
        return new Octokit({
            authStrategy: () => ({ hook: installationOcto.hook }),
            ...common,
        });
    }

    // Unauthenticated fallback (public-only; very small rate limit)
    return new Octokit(common as any);
}
