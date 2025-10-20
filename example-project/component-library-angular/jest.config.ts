export default {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  // @angular-builders/jest already wires the Angular test environment, avoid double init
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec).ts'],
  transform: {
    '^.+\\.(ts|js|html)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html)$' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^@stencil/core/internal$': '<rootDir>/node_modules/@stencil/core/internal/index.js',
    '^component-library/components/(.*)$': '<rootDir>/../component-library/components/$1',
    '^component-library/components$': '<rootDir>/../component-library/components/index.js'
  },
};
