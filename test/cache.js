'use strict'

const path = require('path')

const t = require('tap')

const NYC = require('../self-coverage')
const configUtil = require('../self-coverage/lib/config-util')

const { resetState, runNYC } = require('./helpers')

const fixtures = path.resolve(__dirname, './fixtures')

t.beforeEach(resetState)

async function cacheTest (t, script) {
  const nyc = new NYC(configUtil.buildYargs(fixtures).parse())
  nyc.clearCache()

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
