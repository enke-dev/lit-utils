import type { JestConfigWithTsJest } from 'ts-jest';
import { createDefaultEsmPreset } from 'ts-jest';

const esmPreset = createDefaultEsmPreset({ tsconfig: 'tsconfig.build.json' });
const jestConfig: JestConfigWithTsJest = {
  ...esmPreset,
  // Typescript imports as `*.js` must be mapped manually
  // https://github.com/swc-project/jest/issues/64
  // https://stackoverflow.com/a/75833026/1146207
  moduleNameMapper: { '^(\\.\\.?\\/.+)\\.js$': '$1' },
  testEnvironment: 'jsdom',
};

export default jestConfig;
