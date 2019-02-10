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
    return JSON.stringify(Object.assign(
      {
        istanbul: require('istanbul-lib-coverage/package.json').version,
        nyc: require('../package.json').version
      },
      getInvalidatingOptions(config)
    ))
  }
}
