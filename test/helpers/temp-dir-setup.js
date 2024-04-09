'use strict'

const path = require('path')
const fs = require('fs')
const makeDir = require('make-dir')
const _rimraf = require('rimraf')
const { promisify } = require('util')

const rimraf = promisify(_rimraf)
const mkdtemp = promisify(fs.mkdtemp)

function tempDirSetup (t, testFile) {
  const { dir, name } = path.parse(testFile)
  const tempDirBase = path.resolve(dir, 'temp-dir-' + name)

  makeDir.sync(tempDirBase)

  // Do not use arrow function for beforeEach
  // or afterEach, they need this from tap.
  t.beforeEach(async function (t) {
    t.tempDir = await mkdtemp(tempDirBase + '/')
  })

  t.afterEach(function (t) {
    return rimraf(t.tempDir)
  })

  t.teardown(() => rimraf(tempDirBase))
}

module.exports = tempDirSetup
