var sw = require('spawn-wrap')
var NYC = require('../index.js')

var config = {}
if (process.env.NYC_CONFIG) config = JSON.parse(process.env.NYC_CONFIG)
config.isChildProcess = true

config._processInfo = {
  pid: process.pid,
  ppid: process.ppid,
  root: process.env.NYC_ROOT_ID
}

;(new NYC(config)).wrap()

sw.runMain()
