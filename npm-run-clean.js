#!/usr/bin/env node
'use strict'

const rimraf = require('rimraf').rimraf

Promise.all([
  '**/.nyc_output',
  'node_modules/.cache',
  '.self_coverage',
  'test/**/.cache',
  'test/fixtures/cli/coverage',
  'test/fixtures/cli/fakebin/node',
  'test/fixtures/cli/fakebin/npm',
  'test/fixtures/cli/foo-cache',
  'test/fixtures/cli/nyc-config-js/node_modules',
  'test/temp-dir-*',
  'self-coverage'
].map(f => rimraf(f, { cwd: __dirname, glob: true })))
