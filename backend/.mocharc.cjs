'use strict';

module.exports = {
  require: ['tsx/cjs', './test/force-local-photo-storage.cjs', './test/setup.ts'],
  reporter: './test/reporters/markdown-table-reporter.cjs',
  spec: 'test/**/*.test.ts',
  timeout: 15000,
  exit: true,
};
