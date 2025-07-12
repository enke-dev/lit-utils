import config from '@enke.dev/lint';

export default [
  ...config,
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-unused-expressions': 'off' },
  },
];
