'use strict'

const { fixturesCLI, nycBin } = require('./paths')

module.exports = {
  fixturesCLI,
  nycBin,
  testSuccess: require('./test-success'),
  testFailure: require('./test-failure'),
  runNYC: require('./run-nyc'),
  tempDirSetup: require('./temp-dir-setup')
}
