var fs = require('fs')
var path = require('path')

function InstrumenterIstanbul (cwd) {
  var configFile = path.resolve(cwd, './.istanbul.yml')

  if (!fs.existsSync(configFile)) configFile = undefined
  var istanbul = InstrumenterIstanbul.istanbul()

  return istanbul.createInstrumenter({
    coverageVariable: '__coverage__',
    embedSource: true,
    noCompact: false,
    preserveComments: true
  })
}

InstrumenterIstanbul.istanbul = function () {
  InstrumenterIstanbul._istanbul || (InstrumenterIstanbul._istanbul = require('istanbul-lib-instrument'))

  return InstrumenterIstanbul._istanbul || (InstrumenterIstanbul._istanbul = require('istanbul'))
}

module.exports = InstrumenterIstanbul
