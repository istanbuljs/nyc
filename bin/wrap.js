var sw = require('spawn-wrap')
var NYC = require('../index.js')

var config = {}
if (process.env.NYC_CONFIG) config = JSON.parse(process.env.NYC_CONFIG)
config.isChildProcess = true

config._processInfo = {
  pid: process.pid,
  ppid: process.ppid,
  parent: process.env.NYC_PROCESS_ID || null,
  root: process.env.NYC_ROOT_ID
}
if (process.env.NYC_PROCESSINFO_EXTERNAL_ID) {
  config._processInfo.externalId = process.env.NYC_PROCESSINFO_EXTERNAL_ID
  delete process.env.NYC_PROCESSINFO_EXTERNAL_ID
}

if (process.env.NYC_CONFIG_OVERRIDE) {
  var override = JSON.parse(process.env.NYC_CONFIG_OVERRIDE)
  config = Object.assign(config, override)
  process.env.NYC_CONFIG = JSON.stringify(config)
}

;(new NYC(config)).wrap()

sw.runMain()
