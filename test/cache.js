'use strict'

const path = require('path')
const { promisify } = require('util')

const t = require('tap')
const rimraf = promisify(require('rimraf'))

const NYC = require('../self-coverage')

const { parseArgv, resetState, runNYC } = require('./helpers')

const fixtures = path.resolve(__dirname, './fixtures')

t.beforeEach(resetState)

async function cacheTest (t, script) {
  const nyc = new NYC(await parseArgv(fixtures))
  await rimraf(nyc.cacheDirectory)

  const { status } = await runNYC({
    args: [
      process.execPath,
      script
    ],
    cwd: fixtures,
    env: {}
  })

  t.strictEqual(status, 0)
}

t.test('cache handles collisions', t => cacheTest(t, './cache-collision-runner.js'))

t.test('cache handles identical files', t => cacheTest(t, './identical-file-runner.js'))
