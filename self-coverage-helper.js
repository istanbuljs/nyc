'use strict'

const path = require('path')
const fs = require('fs')
const uuid = require('uuid/v4')
const mkdirp = require('make-dir')
const onExit = require('signal-exit')
const nodePreload = require('node-preload')

if (!nodePreload.includes(__filename)) {
  nodePreload.unshift(__filename)
}

const nycSelfCoverageHelper = Symbol.for('nyc self-test coverage helper')

global[nycSelfCoverageHelper] = {
  registered: false,
  onExit () {
    const coverage = global.___NYC_SELF_COVERAGE___ || {}

    const selfCoverageDir = path.join(__dirname, '.self_coverage')
    mkdirp.sync(selfCoverageDir)
    fs.writeFileSync(
      path.join(selfCoverageDir, uuid() + '.json'),
      JSON.stringify(coverage),
      'utf-8'
    )
  }
}

onExit(() => {
  if (global[nycSelfCoverageHelper].registered) {
    return
  }

  global[nycSelfCoverageHelper].onExit()
})
