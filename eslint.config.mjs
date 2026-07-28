import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The preview build the indexing test produces. Same generated content as
    // .next, which is ignored above — Next's route type files are full of
    // ts-ignore directives and unused bindings, so linting them reports
    // thousands of problems that are not ours to fix.
    ".next-preview/**",
  ]),
]);

export default eslintConfig;
