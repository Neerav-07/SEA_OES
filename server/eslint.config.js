import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'src/db/migrations/meta/**'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: [
      'src/controllers/governance/review.controller.js',
      'src/controllers/integrations/assistant.controller.js',
      'src/db/schema/assessment/aiGovernance.js',
      'src/routes/assistant.route.js',
      'src/services/questionGeneration.service.js',
      'src/services/questionValidation.service.js',
      'src/utils/aiGuardrails.js',
      'src/utils/aiGuardrails.test.js',
    ],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
