import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

const pemFromB64 = (b64: string) => Buffer.from(b64, "base64").toString("utf8");

export function makeApp() {
  const appId = process.env.GITHUB_APP_ID!;
  const key = process.env.GITHUB_PRIVATE_KEY_BASE64!;
  return new App({ appId: Number(appId), privateKey: pemFromB64(key) });
}

export async function installationClient(installationId: number): Promise<Octokit> {
  const app = makeApp();
  // getInstallationOctokit returns an authenticated Octokit client
  const client = (await (app as any).getInstallationOctokit(installationId)) as Octokit;
  return client;
}
