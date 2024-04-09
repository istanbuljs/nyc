'use strict'

const runNYC = require('./run-nyc')

async function testSuccess (t, opts) {
  const { status, stderr, stdout } = await runNYC({
    tempDir: t.tempDir,
    ...opts
  })

  t.equal(status, 0)
  t.equal(stderr, '')
  console.info(stdout)
  t.matchSnapshot(stdout, 'stdout')
}

module.exports = testSuccess
