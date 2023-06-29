'use strict'

const path = require('path')

const t = require('tap')
const { rimraf } = require('rimraf')

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

  t.equal(status, 0)
}

t.test('cache handles collisions', t => cacheTest(t, './cache-collision-runner.js'))

t.test('cache handles identical files', t => cacheTest(t, './identical-file-runner.js'))
