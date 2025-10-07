import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";

describe("openapi generation", () => {
    it("writes bff & runs specs", () => {
        execSync("pnpm --silent contracts:openapi", { stdio: "inherit" });
        expect(fs.existsSync("docs/openapi/bff.openapi.json")).toBe(true);
        expect(fs.existsSync("docs/openapi/runs.openapi.json")).toBe(true);
    });
});
