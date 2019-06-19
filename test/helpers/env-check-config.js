'use strict'

const runNYC = require('./run-nyc')

module.exports = function envCheckConfig (t, { configArgs, checkOptions }) {
  return runNYC({
    tempDir: t.tempDir,
    leavePathSep: true,
    args: [
      ...configArgs,
      process.execPath,
      './env.js'
    ]
  }).then(({ stdout, stderr, status }) => {
    const config = JSON.parse(JSON.parse(stdout).NYC_CONFIG)

    t.is(status, 0)
    t.is(stderr, '')
    t.matchSnapshot(
      JSON.stringify(
        checkOptions.sort().map(option => [option, config[option]]),
        null,
        2
      )
    )
  })
}
