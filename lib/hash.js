'use strict'

function getInvalidatingOptions (config) {
  return [
    'instrument',
    'instrumenter',
    'sourceMap'
  ].reduce((acc, optName) => {
    acc[optName] = config[optName]
    return acc
  }, {})
}

module.exports = {
  salt (config) {
    return JSON.stringify({
      modules: {
        'istanbul-lib-instrument': require('istanbul-lib-coverage/package.json').version,
        nyc: require('../package.json').version
      },
      nycrc: getInvalidatingOptions(config)
    })
  }
}
