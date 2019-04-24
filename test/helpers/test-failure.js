'use strict'

const runNYC = require('./run-nyc')

function testFailure (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 1)
    t.matchSnapshot(stderr, 'stderr')
    t.matchSnapshot(stdout, 'stdout')
  })
}

module.exports = testFailure
