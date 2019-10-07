'use strict'

/* global ___NYC_SELF_COVERAGE___ */

const path = require('path')
const fs = require('fs')
const mkdirp = require('make-dir')
const onExit = require('signal-exit')

module.exports = {
  registered: false,
  onExit () {
    const coverage = ___NYC_SELF_COVERAGE___

    const selfCoverageDir = path.join(__dirname, '.self_coverage')
    mkdirp.sync(selfCoverageDir)
    fs.writeFileSync(
      path.join(selfCoverageDir, process.pid + '.json'),
      JSON.stringify(coverage),
      'utf-8'
    )
  }
}

onExit(() => {
  if (module.exports.registered) {
    return
  }

  module.exports.onExit()
})
