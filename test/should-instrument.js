'use strict'

const path = require('path')
const NYC = require('../self-coverage')

const { parseArgv } = require('./helpers')

const fixtures = path.resolve(__dirname, './fixtures')

const t = require('tap')

const rootDir = path.resolve('/')
t.test('should exclude appropriately with defaults', async t => {
  const nyc = new NYC(await parseArgv(rootDir, [
    '--exclude=test/**',
    '--exclude=test{,-*}.js',
    '--exclude=**/*.test.js',
    '--exclude=**/__tests__/**'
  ]))

  // nyc always excludes "node_modules/**"
  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo.js'), 'foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'node_modules/bar.js'), 'node_modules/bar.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo/node_modules/bar.js'), 'foo/node_modules/bar.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'test.js'), 'test.js'))
  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'testfoo.js'), 'testfoo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'test-foo.js'), 'test-foo.js'))
  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'lib/test.js'), 'lib/test.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo/bar/test.js'), './test.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo/bar/test.js'), '.\\test.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo/bar/foo.test.js'), './foo.test.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo/bar/__tests__/foo.js'), './__tests__/foo.js'))
})

t.test('should exclude appropriately with config.exclude', async t => {
  const nyc = new NYC(await parseArgv(fixtures))

  // fixtures/package.json configures excludes: "blarg", "blerg"
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blarg.js'), 'blarg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blarg/foo.js'), 'blarg/foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), 'blerg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), './blerg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), '.\\blerg.js'))
})

t.test('should exclude outside of the current working directory', async t => {
  const nyc = new NYC(await parseArgv(path.join(rootDir, 'foo')))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'bar.js'), '../bar.js'))
})

t.test('should not exclude if the current working directory is inside node_modules', async t => {
  const cwd = path.join(rootDir, 'node_modules', 'foo')
  const nyc = new NYC(await parseArgv(cwd))
  t.true(nyc.exclude.shouldInstrument(path.join(cwd, 'bar.js'), './bar.js'))
  t.true(nyc.exclude.shouldInstrument(path.join(cwd, 'bar.js'), '.\\bar.js'))
})

t.test('allows files to be explicitly included, rather than excluded', async t => {
  const nyc = new NYC(await parseArgv(rootDir, ['--include=foo.js']))

  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo.js'), 'foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'index.js'), 'index.js'))
})

t.test('exclude overrides include', async t => {
  const nyc = new NYC(await parseArgv(rootDir, [
    '--include=foo.js',
    '--include=test.js',
    '--exclude=**/node_modules/**',
    '--exclude=test/**',
    '--exclude=test{,-*}.js'
  ]))

  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo.js'), 'foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'test.js'), 'test.js'))
})
