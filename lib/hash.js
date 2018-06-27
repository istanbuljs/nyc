'use strict'

module.exports = {
  salt: JSON.stringify({
    istanbul: require('istanbul-lib-coverage/package.json').version,
    nyc: require('../package.json').version
  })
}
