'use strict'

var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var forkingTap = require('forking-tap')
var zeroFill = require('zero-fill')
var sanitizeFilename = require('sanitize-filename')

// Delete previous files.
process.chdir(__dirname)
rimraf.sync('test/build')
mkdirp.sync(path.join(__dirname, 'test/build'))

var testDir = path.join(__dirname, 'test/src')
var buildDir = path.join(__dirname, 'test/build')
var originalTestsFilename = path.join(testDir, 'nyc-test.js')
var originalTestSource = fs.readFileSync(originalTestsFilename, 'utf8')
var individualTests = forkingTap(originalTestSource, {
  filename: originalTestsFilename,
  attachComment: true
})

function writeTest (test, i, enableCache) {
  var filename = ['built', zeroFill(3, i)]
      .concat(test.nestedName)
      .join('-')

  if (enableCache) {
    filename += '-cache'
  }

  filename += '.js'

  // file names with spaces are legal, but annoying to use w/ CLI commands
  filename = filename.replace(/\s/g, '_')

  // istanbul freaks out if the there are `'` characters in the file name
  filename = filename.replace(/'/g, '')

  // remove any illegal chars
  filename = sanitizeFilename(filename)

  var code = test.code
  if (enableCache) {
    code = code.replace('var enableCache = false', 'var enableCache = true')
  }

  fs.writeFileSync(path.join(buildDir, filename), code)
}

individualTests.forEach(function (test, i) {
  writeTest(test, i * 2, false)
  writeTest(test, i * 2 + 1, true)
})
