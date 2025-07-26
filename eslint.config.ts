import config from '@enke.dev/lint';

export default [
  ...config,
  {
    ignores: ['docs/api', 'docs/.vitepress/cache', 'docs/.vitepress/dist'],
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-unused-expressions': 'off' },
  },
];
