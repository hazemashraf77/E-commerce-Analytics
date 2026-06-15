const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * ESLint per 048_PROJECT_BOOTSTRAP.md: type safety, import order,
 * unused variables, React/Next best practices, accessibility.
 * eslint-config-next bundles react, react-hooks, jsx-a11y and next rules.
 */
module.exports = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "import/order": [
        "warn",
        { groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]] },
      ],
    },
  },
  { ignores: [".next/", "node_modules/", "prisma/migrations/"] },
];
