'use strict'

const path = require('path')

const t = require('tap')

const { testSuccess } = require('./helpers')

const cwd = path.resolve(__dirname, 'fixtures')

t.test('eager disabled by default', t => testSuccess(t, {
  args: [
    '--silent=true',
    '--exclude=eager.js',
    process.execPath,
    './eager.js'
  ],
  cwd
}))

t.test('eager enabled', t => testSuccess(t, {
  args: [
    '--silent=true',
    '--eager=true',
    '--exclude=eager.js',
    process.execPath,
    './eager.js'
  ],
  cwd
}))
