'use strict'

const runNYC = require('./run-nyc')

async function envCheckConfig (t, { configArgs, checkOptions }) {
  const { stdout, stderr, status } = await runNYC({
    tempDir: t.tempDir,
    leavePathSep: true,
    args: [
      ...configArgs,
      process.execPath,
      './env.js'
    ]
  })

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
}

module.exports = envCheckConfig
