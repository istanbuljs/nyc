const CACHE_VERSION = require('../package.json').version
const crypto = require('crypto')
const salt = JSON.stringify({
  istanbul: require('istanbul-lib-coverage/package.json').version,
  nyc: CACHE_VERSION
})

function Hash (code, filename) {
  const hash = crypto.createHash('sha256')

  hash.update(code)
  hash.update(filename)
  hash.update(salt)

  return hash.digest('hex') + '_' + CACHE_VERSION
}

Hash.salt = salt

module.exports = Hash
