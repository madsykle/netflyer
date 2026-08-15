import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextConfig,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "public/generated/**",
    ".scratch/**",
    ".commandcode/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/triple-slash-reference": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/error-boundaries": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/media-has-caption": "off",
      "react/no-unknown-property": "off",
    },
  },
]);
