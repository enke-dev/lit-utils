import config, { setTsConfigRootDir } from '@enke.dev/lint/eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...config,
  setTsConfigRootDir(import.meta.dirname),
  {
    ignores: ['docs/api', 'docs/.vitepress/cache', 'docs/.vitepress/dist', 'lib/'],
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-unused-expressions': 'off' },
  },
]);
