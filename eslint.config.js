import js from "@eslint/js";
export default [{
    ignores: [
        "node_modules",
        "dist",
        "coverage",
        "docs/api",
        "docs/jsonschema",
        "docs/openapi",
        "docs/site-docs.zip",
        "datasets/snapshots",
        "**/*.d.ts"
    ],
},

js.configs.recommended,
{
    files: ["**/*.ts"],
    languageOptions: { parserOptions: { ecmaVersion: "latest", sourceType: "module" } },
    rules: {
        "no-unused-vars": "warn",
        "no-undef": "error"
    }
}
];
