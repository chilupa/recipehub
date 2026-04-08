import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "android/**",
      "ios/**",
      "node_modules/**",
      "**/build/**",
      "**/DerivedData/**",
      "coverage/**",
      "cypress.config.ts",
      "supabase/functions/**",
    ],
  },
  {
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts", "capacitor.config.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        process: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-console":
        process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger":
        process.env.NODE_ENV === "production" ? "warn" : "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/contexts/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["src/pages/Intro.tsx"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowExportNames: ["hasSeenIntro", "setIntroSeen"] },
      ],
    },
  },
);
