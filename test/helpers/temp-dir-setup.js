const path = require('path')
const fs = require('fs')
const makeDir = require('make-dir')
const _rimraf = require('rimraf')
const pify = require('pify')

const rimraf = pify(_rimraf)
const mkdtemp = pify(fs.mkdtemp)

function tempDirSetup (t, testFile) {
  const { dir, name } = path.parse(testFile)
  const tempDirBase = path.resolve(dir, 'temp-dir-' + name)

  makeDir.sync(tempDirBase)

  // Do not use arrow function for beforeEach
  // or afterEach, they need this from tap.
  t.beforeEach(function () {
    return mkdtemp(tempDirBase + '/').then(tempDir => {
      this.tempDir = tempDir
    })
  })

  t.afterEach(function () {
    return rimraf(this.tempDir)
  })

  t.tearDown(() => rimraf(tempDirBase))
}

module.exports = tempDirSetup
