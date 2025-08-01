import prettier from "eslint-plugin-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [...compat.extends(
  "next/core-web-vitals",
  "plugin:prettier/recommended"
), {
  plugins: {
    prettier,
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "max-len": ["error", {
        code: 120,
        ignorePattern: "((let|const|var).*(import|require).*)|(import.*from.*)",
      }],
      "no-nested-ternary": 0,
      "no-unused-vars": "off",
      semi: ["error", "always"],
      quotes: ["error", "single"],
      "prettier/prettier": "error",
      "react/jsx-filename-extension": ["warn", {
        extensions: [".js", ".jsx", "ts", ".tsx"],
      }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^ignored",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "import/order": ["error", {
        groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
            caseInsensitive: true,
          },
        }
      ],
    },
  }
];
