var sw = require('spawn-wrap')
var NYC
try {
  NYC = require('../index.covered.js')
} catch (e) {
  NYC = require('../index.js')
}

;(new NYC({
  require: process.env.NYC_REQUIRE ? process.env.NYC_REQUIRE.split(',') : [],
  extension: process.env.NYC_EXTENSION ? process.env.NYC_EXTENSION.split(',') : [],
  enableCache: process.env.NYC_CACHE === 'enable'
})).wrap()

sw.runMain()
