'use strict';

module.exports = {
  require: ['tsx/cjs', './test/setup.ts'],
  spec: 'test/**/*.test.ts',
  timeout: 15000,
  exit: true, // force exit once all tests finish (needed for open DB connections)
};
