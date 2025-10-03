import { describe, it, expect } from "vitest";
import fs from "node:fs";
import YAML from "yaml";

const candidates = [
    "docs/access/selacc_github_app.yaml",
    "docs/access/selacc_github_app.yml",
    // fallback to generic if you already have it
    "docs/access/github_app.yaml",
    "docs/access/github_app.yml",
];

function firstExisting(p: string[]) {
    for (const f of p) if (fs.existsSync(f)) return f;
    return null;
}

describe("SELACC – GitHub App access plan", () => {
    it("exists and declares minimal read-only permissions + webhook events", () => {
        const file = firstExisting(candidates);
        expect(file, `Missing one of: ${candidates.join(", ")}`).toBeTruthy();

        const raw = fs.readFileSync(file!, "utf8");
        const y = YAML.parse(raw) || {};
        const perms = y.permissions || y.app?.permissions || {};
        const events: string[] = y.events || y.webhooks || y.subscriptions || [];

        ["contents", "issues", "pull_requests"].forEach((k) => {
            expect(perms[k], `permissions.${k} must be 'read'`).toBe("read");
        });
        if (perms.metadata !== undefined) expect(perms.metadata).toBe("read");

        ["installation", "installation_repositories"].forEach((e) => {
            expect(events.includes(e), `events should include '${e}'`).toBe(true);
        });

        const sel =
            y.repository_access ||
            y.repository_selection ||
            y.installation?.repository_selection;
        if (sel !== undefined) {
            expect(String(sel).toLowerCase()).toMatch(/selected/);
        }
    });
});
