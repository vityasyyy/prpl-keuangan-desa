/** @type {import('jest').Config} */
export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The root directory that Jest should scan for tests and modules within
  roots: ["<rootDir>/src"],

  // A list of paths to directories that Jest should use to search for files in
  testMatch: [
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],

  // This is critical for ESM support
  transform: {},

  // Stop running tests after the first N failures
  bail: 1,

  // Show a log of open handles that are preventing Jest from exiting cleanly
  detectOpenHandles: true,
};
