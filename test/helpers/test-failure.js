'use strict'

const runNYC = require('./run-nyc')

async function testFailure (t, opts) {
  const { status, stderr, stdout } = await runNYC({
    tempDir: t.tempDir,
    ...opts
  })

  t.equal(status, 1)
  t.matchSnapshot(stderr, 'stderr')
  t.matchSnapshot(stdout, 'stdout')
}

module.exports = testFailure
