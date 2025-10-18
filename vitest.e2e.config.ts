
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        dir: ".",                            // repo root
        include: ["tests/selacc.webhook.e2e.spec.ts"],  // pin exact file
        exclude: ["**/node_modules/**", "**/dist/**"],
        environment: "node",
        passWithNoTests: false,
        // reporters can be controlled via CLI (--reporter verbose) from CI
    },
});

