'use strict'

const fs = require('fs')
const path = require('path')

const t = require('tap')

const NYC = require('../self-coverage')

const { parseArgv, resetState } = require('./helpers')

// we test exit handlers in nyc-integration.js.
NYC.prototype._wrapExit = () => {}

const fixtures = path.resolve(__dirname, 'fixtures')
const configMultExt = path.resolve(fixtures, 'conf-multiple-extensions')

t.beforeEach(resetState)

t.test('wraps modules with coverage counters when they are required', async t => {
  const nyc = new NYC(await parseArgv())
  await nyc.reset()
  nyc.wrap()

  const check = require('./fixtures/check-instrumented')
  t.strictEqual(check(), true)
})

t.test('wraps modules with coverage counters when the custom require hook compiles them', async t => {
  let required = false
  const hook = function (module, filename) {
    if (filename.indexOf('check-instrumented.js') !== -1) {
      required = true
    }
    module._compile(fs.readFileSync(filename, 'utf8'), filename)
  }

  const nyc = new NYC(await parseArgv())
  await nyc.reset()
  nyc.wrap()

  // install the custom require hook
  require.extensions['.js'] = hook // eslint-disable-line

  const check = require('./fixtures/check-instrumented')
  t.strictEqual(check(), true)
  t.strictEqual(required, true)
})

t.test('assigns a function to custom extensions', async t => {
  const nyc = new NYC(await parseArgv(configMultExt))
  await nyc.reset()
  nyc.wrap()

  t.type(require.extensions['.es6'], 'function') // eslint-disable-line
  t.type(require.extensions['.foo.bar'], 'function') // eslint-disable-line

  // default should still exist
  t.type(require.extensions['.js'], 'function') // eslint-disable-line
})

t.test('calls the `_handleJs` function for custom file extensions', async t => {
  const required = {}
  const nyc = new NYC(await parseArgv(configMultExt))

  nyc._handleJs = (code, options) => {
    if (options.filename.includes('check-instrumented.es6')) {
      required.es6 = true
    }

    if (options.filename.includes('check-instrumented.foo.bar')) {
      required.custom = true
    }

    return code
  }

  await nyc.reset()
  nyc.wrap()

  require('./fixtures/conf-multiple-extensions/check-instrumented.es6')
  require('./fixtures/conf-multiple-extensions/check-instrumented.foo.bar')
  t.strictEqual(required.custom, true)
  t.strictEqual(required.es6, true)
})

t.test('does not output coverage for files that have not been included, by default', async t => {
  const nyc = new NYC(await parseArgv(process.cwd()))
  nyc.wrap()
  await nyc.reset()

  const reports = (await nyc.coverageData()).filter(report => report['./test/fixtures/not-loaded.js'])
  t.strictEqual(reports.length, 0)
})

t.test('tracks coverage appropriately once the file is required', async t => {
  const nyc = new NYC(await parseArgv(fixtures))
  await nyc.reset()
  nyc.wrap()

  require('./fixtures/not-loaded')

  nyc.writeCoverageFile()

  const notLoadedPath = path.join(fixtures, './not-loaded.js')
  const reports = (await nyc.coverageData()).filter(report => report[notLoadedPath])
  const report = reports[0][notLoadedPath]

  t.strictEqual(reports.length, 1)
  t.strictEqual(report.s['0'], 1)
  t.strictEqual(report.s['1'], 1)
})
