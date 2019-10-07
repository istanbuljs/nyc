'use strict'

const { test } = require('tap')
const yargs = require('yargs/yargs')

const processArgs = require('../self-coverage/lib/process-args')

const nycBin = require.resolve('../self-coverage/bin/nyc.js')

test('hideInstrumenterArgs removes dashed options that proceed bin', async t => {
  process.argv = [
    process.execPath,
    nycBin,
    '--reporter',
    'lcov',
    'node',
    'test/nyc-tap.js'
  ]

  const { argv } = yargs(process.argv.slice(2))
  const munged = processArgs.hideInstrumenterArgs(argv)

  t.strictSame(munged, ['node', 'test/nyc-tap.js'])
})

test('hideInstrumenterArgs parses extra args directly after -- as Node execArgv', async t => {
  process.argv = [
    process.execPath,
    nycBin,
    '--',
    '--expose-gc',
    'index.js'
  ]

  const { argv } = yargs(process.argv.slice(2))
  const munged = processArgs.hideInstrumenterArgs(argv)

  t.strictSame(munged, [process.execPath, '--expose-gc', 'index.js'])
})

test('hideInstrumenteeArgs ignores arguments after the instrumented bin', async t => {
  process.argv = [
    process.execPath,
    nycBin,
    '--reporter',
    'lcov',
    'node',
    'test/nyc-tap.js',
    '--arg',
    '--'
  ]

  const munged = processArgs.hideInstrumenteeArgs()
  t.strictSame(munged, ['--reporter', 'lcov', 'node'])
})

test('hideInstrumenteeArgs does not ignore arguments if command is recognized', async t => {
  process.argv = [
    process.execPath,
    nycBin,
    'report',
    '--reporter',
    'lcov'
  ]

  const munged = processArgs.hideInstrumenteeArgs()
  t.strictSame(munged, ['report', '--reporter', 'lcov'])
})

test('hideInstrumenteeArgs does not ignore arguments if no command is provided', async t => {
  process.argv = [
    process.execPath,
    nycBin,
    '--version'
  ]

  const munged = processArgs.hideInstrumenteeArgs()
  t.strictSame(munged, ['--version'])
})
