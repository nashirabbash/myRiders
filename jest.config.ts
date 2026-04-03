import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    // Stub native modules that can't run in Node
    "^expo-sqlite$": "<rootDir>/src/data/sqlite/__mocks__/expo-sqlite.ts",
  },
};

export default config;
