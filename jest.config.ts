import type {Config} from 'jest';

const config: Config = {
  preset: "ts-jest",
  verbose: true,
  coverageReporters: ['lcov'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['./src/**/*.ts', '!./src/**/*.{d,interface}.ts']
};

export default config;