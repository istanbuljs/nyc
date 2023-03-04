#!/usr/bin/env node
'use strict'

const glob = require('glob')
const rimraf = require('rimraf')

const patterns = [
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
]

patterns.forEach(pattern => {
  glob.globSync(pattern)
    .forEach((f) => rimraf(f))
})
