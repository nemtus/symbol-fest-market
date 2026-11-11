// ESLint flat config (ESLint 9).
// Migrated from .eslintrc.json: eslint-config-airbnb / eslint-config-airbnb-typescript
// only support ESLint 8, so the same Airbnb rule set is pulled in via the
// flat-config port `eslint-config-airbnb-extended` (legacy = 1:1 Airbnb rules).
import js from '@eslint/js';
import { configs as airbnbLegacy } from 'eslint-config-airbnb-extended/legacy';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build/**', 'functions/lib/**', 'node_modules/**'] },
  js.configs.recommended,
  // airbnb + airbnb/react + jsx-a11y (≒ eslint-config-airbnb)
  ...airbnbLegacy.react.recommended,
  // ≒ eslint-config-airbnb-typescript
  ...airbnbLegacy.react.typescript,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      'no-use-before-define': 'off', //関数や変数が定義される前に使われているとエラーになるデフォルトの機能をoff
      '@typescript-eslint/no-use-before-define': ['error'], //typescript側のno-use-before-defineを使うようにする
      'import/prefer-default-export': 'off', //named exportがエラーになるので使えるようにoff
      '@typescript-eslint/no-unused-vars': 'off', //unused-importsを使うため削除
      'unused-imports/no-unused-imports': 'error', //不要なimportの削除
      'unused-imports/no-unused-vars': [
        //unused-importsでno-unused-varsのルールを再定義
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'no-param-reassign': [2, { props: false }], //パラメーターのプロパティ変更を許可
      'react/jsx-one-expression-per-line': 0,
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }], //jsx形式のファイル拡張子をjsxもしくはtsxに限定
      'react/react-in-jsx-scope': 'off', //import React from 'react'が無くてもエラーを無くす
      'react/function-component-definition': [2, { namedComponents: 'arrow-function' }], //アロー関数以外受け付けない設定
      'react/jsx-props-no-spreading': 'off',
      'react/prop-types': 'off', //TypeScriptでチェックしているから不要。offにする
      'no-void': [
        //void演算子の許可
        'error',
        {
          allowAsStatement: true,
        },
      ],
      'import/extensions': [
        //importのときに以下の拡張子を記述しなくてもエラーにしない
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
  {
    files: ['src/setupTests.ts', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  prettier,
);
