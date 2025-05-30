import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Base JavaScript configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,vue}"],
    languageOptions: {
      globals: globals.browser,
      sourceType: "module"
    },
    ...js.configs.recommended
  },
  // TypeScript configuration
  ...tseslint.configs.recommended,
  // Vue configuration
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
        extraFileExtensions: [".vue"]
      }
    }
  },
  // General custom configurations
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.app.json",
        projectService: {
          allowDefaultProject: ["*.js", "env.d.ts"]
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  // Import plugin configuration
  // Enforce no extensions since "bundler" doesn't require it
  {
    ...importPlugin.flatConfigs.recommended,
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".mjs", ".cjs", ".ts", ".tsx", ".vue"]
        },
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json"
        }
      }
    },
    rules: {
      "import/extensions": [
        "error",
        "always",
        {
          js: "never",
          mjs: "always",
          cjs: "always",
          ts: "never",
          tsx: "always",
          vue: "always",
          "d.ts": "never"
        }
      ],
      "import/no-unresolved": ["error", { ignore: ["^@/", "^~"] }]
    }
  },
  // Other rules
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
