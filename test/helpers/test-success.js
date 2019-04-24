'use strict'

const runNYC = require('./run-nyc')

function testSuccess (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 0)
    t.equal(stderr, '')
    t.matchSnapshot(stdout, 'stdout')
  })
}

module.exports = testSuccess
