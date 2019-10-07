'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const t = require('tap')
const isWindows = require('is-windows')()
const rimraf = promisify(require('rimraf'))

const NYC = require('../self-coverage')

const { parseArgv, runNYC, resetState } = require('./helpers')

const fixtures = path.resolve(__dirname, 'fixtures')

t.beforeEach(resetState)

async function testSignal (t, signal) {
  if (isWindows) {
    t.end()

    return
  }

  const nyc = new NYC(await parseArgv(fixtures))
  await runNYC({
    args: [`./${signal}.js`],
    cwd: fixtures
  })

  const checkFile = path.join(fixtures, `${signal}.js`)
  const reports = (await nyc.coverageData()).filter(report => report[checkFile])

  t.strictEqual(reports.length, 1)
}

t.test('writes coverage report when process is killed with SIGTERM', t => testSignal(t, 'sigterm'))

t.test('writes coverage report when process is killed with SIGINT', t => testSignal(t, 'sigint'))

t.test('allows coverage report to be output in an alternative directory', async t => {
  const nyc = new NYC(await parseArgv(undefined, [
    '--report-dir=./alternative-report',
    '--reporter=lcov'
  ]))
  await nyc.reset()

  await nyc.report()
  t.strictEqual(fs.existsSync('./alternative-report/lcov.info'), true)
  await rimraf('./alternative-report')
})
