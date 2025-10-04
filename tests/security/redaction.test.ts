import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import path from "node:path";

describe("PII redaction validator", () => {
    it("fails if PII found", () => {
        // prepare temp file with fake email
        execSync("echo '{\"body\":\"hello test@example.com\"}' > tmp.jsonl");
        let failed = false;

        try { execSync("ts-node tooling/validate_redaction.ts"); }
        catch { failed = true; }
        expect(failed).toBe(true);
    });

    it("passes when clean", () => {
        execSync("echo '{\"body\":\"clean text\"}' > tmp.jsonl");
        execSync("ts-node tooling/validate_redaction.ts");
    });
});
