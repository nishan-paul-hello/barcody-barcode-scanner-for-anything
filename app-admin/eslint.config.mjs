import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      'public/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // General
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'curly': ['error', 'all'],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'no-use-before-define': 'off',

      // Typescript
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/restrict-template-expressions': ['warn', { allowNumber: true }],

      // React
      ...reactPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      
      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export default eslintConfig;
