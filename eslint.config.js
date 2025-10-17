import js from "@eslint/js";
export default [
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
