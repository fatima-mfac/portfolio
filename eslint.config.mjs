// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Note: a globalIgnores() call REPLACES ESLint's built-in defaults rather
  // than extending them, so node_modules has to be listed explicitly here —
  // without it, ESLint walks every dependency it can reach.
  globalIgnores([
    // ESLint's own default, restored:
    "**/node_modules/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build artefacts and local Claude Code data (worktrees, sessions).
    "storybook-static/**",
    ".claude/**",
  ]),
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
