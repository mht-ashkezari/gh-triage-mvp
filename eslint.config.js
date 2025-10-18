// eslint.config.js
import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
    // --- Global ignore rules ---
    {
        ignores: [
            "node_modules/**",
            "**/dist/**",
            "coverage/**",
            "docs/api",
            "docs/jsonschema",
            "docs/openapi",
            "docs/site-docs.zip",
            "datasets/snapshots",
            "**/*.d.ts",
        ],
    },

    // --- Base JS rules ---
    js.configs.recommended,

    // --- TypeScript (type-aware for app code) ---
    ...ts.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: ts.parser,
            parserOptions: {
                project: [
                    "./tsconfig.json",
                    "apps/bff/tsconfig.json",
                    "packages/*/tsconfig.json",
                ],
                tsconfigRootDir: process.cwd(),
                ecmaVersion: 2022,
                sourceType: "module",
                ecmaFeatures: { legacyDecorators: true },
            },
            globals: {
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
            },
        },
        rules: {
            "no-undef": "off",
            "no-cond-assign": "off",
            "prefer-const": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "off",
        },
    },

    // --- ⬇ NEW: do NOT require a TS project for config scripts ⬇ ---
    {
        files: [
            "**/vitest*.config.ts",
            "**/vite.config.*.*",
            "**/*.config.{ts,js,mjs,cjs}",
        ],
        languageOptions: {
            parserOptions: { project: null }, // disable type-aware parsing for these
        },
    },
];
