import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import mktplace from './scripts/eslint/mktplace-plugin.mjs';

const jsxA11yBaselineRules = [
  'alt-text',
  'aria-props',
  'aria-proptypes',
  'aria-unsupported-elements',
  'role-has-required-aria-props',
  'role-supports-aria-props',
];

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      mktplace,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.flat.recommended.rules,
      'react/prop-types': 'off',
      ...Object.fromEntries(jsxA11yBaselineRules.map((rule) => [`jsx-a11y/${rule}`, 'warn'])),
      'mktplace/no-html-image': 'warn',
      'mktplace/require-next-link': 'error',
      'mktplace/no-next-head-import': 'error',
      'mktplace/no-next-document-import': 'error',
      'mktplace/no-html-head': 'warn',
      'mktplace/no-sync-script': 'error',
      'mktplace/no-inline-script-id': 'error',
      'mktplace/no-async-client-component': 'warn',
      'mktplace/no-server-only-imports-in-client': 'error',
      'mktplace/no-server-env-in-client': 'error',
    },
  },
]);
