import { ReleaseNotesV1 } from "./entities.js";

/** Parse+validate model JSON and apply a tiny allowlist rule for links. */
export function parseReleaseJson(raw: string, githubRepoSlug: string) {
    const attempt = (s: string) => {
        const data = JSON.parse(s);
        const parsed = ReleaseNotesV1.safeParse(data);
        if (!parsed.success) throw new Error("invalid.schema");
        parsed.data.items.forEach(i => {
            if (!i.link.startsWith(`https://github.com/${githubRepoSlug}/`))
                throw new Error("invalid.link");
        });
        return parsed.data;
    };
    try {
        return attempt(raw);
    } catch {
        const repaired = raw.replace(/```json|```/g, "").replace(/,(\s*[}\]])/g, "$1");
        return attempt(repaired);
    }
}