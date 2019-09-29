'use strict'

const path = require('path')
const t = require('tap')

const { testSuccess } = require('./helpers')
const fixturesTSC = path.resolve(__dirname, 'fixtures/tsc')

t.test('reads source-map', t => testSuccess(t, {
  cwd: fixturesTSC,
  args: [
    '--produce-source-map=true',
    '--cache=false',
    process.execPath,
    'mapping.js'
  ]
}))

t.test('ignore source-map', t => testSuccess(t, {
  cwd: fixturesTSC,
  args: [
    '--produce-source-map=true',
    '--no-source-map',
    '--cache=false',
    process.execPath,
    'mapping.js'
  ]
}))
