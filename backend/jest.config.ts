export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'], // Where your test files will live
  setupFilesAfterEnv: ['./test/jest.setup.ts'], // Optional for extra setup
  clearMocks: true,
};