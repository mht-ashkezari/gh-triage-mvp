import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        dir: ".",                              // root is apps/bff
        include: ["**/*.spec.ts", "**/*.test.ts"], // <= works with ANY root
        exclude: ["**/node_modules/**", "**/dist/**"],
        environment: "node",
        passWithNoTests: false,
        setupFiles: ["./test/setup-env.ts"],
        coverage: { provider: "v8", reporter: ["text", "lcov"] },
    },
});