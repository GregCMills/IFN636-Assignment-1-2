'use strict';

module.exports = {
  require: ['./test/setup.js'],
  timeout: 15000,
  exit: true, // force exit once all tests finish (needed for open DB connections)
};
