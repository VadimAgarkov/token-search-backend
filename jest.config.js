"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    testRegex: '.*\\.spec\\.ts$',
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    coverageDirectory: 'coverage',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
};
//# sourceMappingURL=jest.config.js.map