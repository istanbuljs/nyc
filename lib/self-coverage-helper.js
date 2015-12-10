/* global ___nyc_self_coverage___ */

var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var onExit = require('signal-exit')

onExit(function () {
  var coverage = global.___nyc_self_coverage___
  if (typeof ___nyc_self_coverage___ === 'object') coverage = ___nyc_self_coverage___
  if (!coverage) return

  var selfCoverageDir = path.join(__dirname, '../.self_coverage')
  mkdirp.sync(selfCoverageDir)
  fs.writeFileSync(
    path.join(selfCoverageDir, process.pid + '.json'),
    JSON.stringify(coverage),
    'utf-8'
  )
})
