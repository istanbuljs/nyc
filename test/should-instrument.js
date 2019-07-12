const path = require('path')
const NYC = require('../self-coverage')
const configUtil = require('../self-coverage/lib/config-util')
const fixtures = path.resolve(__dirname, './fixtures')

const t = require('tap')

const rootDir = path.resolve('/')
t.test('should exclude appropriately with defaults', t => {
  const nyc = new NYC(configUtil.buildYargs(rootDir).parse([
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
  t.done()
})

t.test('should exclude appropriately with config.exclude', t => {
  const nyc = new NYC(configUtil.buildYargs(fixtures).parse())

  // fixtures/package.json configures excludes: "blarg", "blerg"
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blarg.js'), 'blarg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blarg/foo.js'), 'blarg/foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), 'blerg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), './blerg.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'blerg.js'), '.\\blerg.js'))
  t.done()
})

t.test('should exclude outside of the current working directory', t => {
  const nyc = new NYC(configUtil.buildYargs(path.join(rootDir, 'foo')).parse())
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'bar.js'), '../bar.js'))
  t.done()
})

t.test('should not exclude if the current working directory is inside node_modules', t => {
  const cwd = path.join(rootDir, 'node_modules', 'foo')
  const nyc = new NYC(configUtil.buildYargs(cwd).parse())
  t.true(nyc.exclude.shouldInstrument(path.join(cwd, 'bar.js'), './bar.js'))
  t.true(nyc.exclude.shouldInstrument(path.join(cwd, 'bar.js'), '.\\bar.js'))
  t.done()
})

t.test('allows files to be explicitly included, rather than excluded', t => {
  const nyc = new NYC(configUtil.buildYargs(rootDir).parse(['--include=foo.js']))

  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo.js'), 'foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'index.js'), 'index.js'))
  t.done()
})

t.test('exclude overrides include', t => {
  const nyc = new NYC(configUtil.buildYargs(rootDir).parse([
    '--include=foo.js',
    '--include=test.js',
    '--exclude=**/node_modules/**',
    '--exclude=test/**',
    '--exclude=test{,-*}.js'
  ]))

  t.true(nyc.exclude.shouldInstrument(path.join(rootDir, 'foo.js'), 'foo.js'))
  t.false(nyc.exclude.shouldInstrument(path.join(rootDir, 'test.js'), 'test.js'))
  t.done()
})
