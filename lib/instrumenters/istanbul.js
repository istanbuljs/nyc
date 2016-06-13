var fs = require('fs')
var path = require('path')

function InstrumenterIstanbul (cwd) {
  var configFile = path.resolve(cwd, './.istanbul.yml')

  if (!fs.existsSync(configFile)) configFile = undefined
  var istanbul = InstrumenterIstanbul.istanbul()
  var instrumenterConfig = istanbul.config.loadFile(configFile).instrumentation.config

  return new istanbul.Instrumenter({
    coverageVariable: '__coverage__',
    embedSource: instrumenterConfig['embed-source'],
    noCompact: !instrumenterConfig.compact,
    preserveComments: instrumenterConfig['preserve-comments']
  })
}

InstrumenterIstanbul.istanbul = function () {
  return InstrumenterIstanbul._istanbul || (InstrumenterIstanbul._istanbul = require('istanbul'))
}

module.exports = InstrumenterIstanbul
