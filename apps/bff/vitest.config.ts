import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        dir: ".",                              // root is apps/bff
        include: ["test/**/*.spec.ts", "test/**/*.test.ts"],
        environment: "node",
        passWithNoTests: false,
        setupFiles: ["./test/setup-env.ts"],   // keep only if this file exists (see step 2)
        coverage: { provider: "v8", reporter: ["text", "lcov"] },
    },
});