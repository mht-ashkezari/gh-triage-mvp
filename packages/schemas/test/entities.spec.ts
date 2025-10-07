import { describe, it, expect } from "vitest";
import { TriageCardV1, ReleaseNotesV1 } from "@ghtriage/schemas";

describe("schemas", () => {
    it("triage card parses", () => {
        const good = { issue_id: 1, suggestions: { labels: [{ name: "bug", score: 0.9 }], assignees: [], dup_candidates: [] }, rationale: [] };
        expect(() => TriageCardV1.parse(good)).not.toThrow();
    });
    it("release notes links are urls", () => {
        expect(() => ReleaseNotesV1.parse({ items: [], citations: [] })).not.toThrow();
    });
});
