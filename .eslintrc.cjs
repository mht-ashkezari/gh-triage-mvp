module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "tsdoc", "jsdoc"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
      "tsdoc/syntax": "warn",
      // Turn this to "error" later to enforce docstrings on public APIs
      "jsdoc/require-jsdoc": ["off", { publicOnly: true }],
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-indentation": "warn",
      "jsdoc/check-tag-names": "warn"
    },
    ignorePatterns: ["docs/api/**", "docs/openapi/**", "docs/jsonschema/**"]
  };
  