module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.(js|ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};