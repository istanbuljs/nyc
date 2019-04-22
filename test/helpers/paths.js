'use strict'

const path = require('path')

module.exports = {
  nycBin: require.resolve('../../self-coverage/bin/nyc'),
  fixturesCLI: path.resolve(__dirname, '../fixtures/cli')
}
