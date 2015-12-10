'use strict'

var fs = require('fs')
var path = require('path')
var del = require('del')
var forkingTap = require('forking-tap')
var zeroFill = require('zero-fill')
var sanitizeFilename = require('sanitize-filename')

// Delete previous files.
process.chdir(__dirname)
del.sync(['test/built-*'])

var testDir = path.join(__dirname, 'test')
var originalTestsFilename = path.join(testDir, 'nyc-test.js')
var originalTestSource = fs.readFileSync(originalTestsFilename, 'utf8')
var individualTests = forkingTap(originalTestSource, {
  filename: originalTestsFilename,
  attachComment: true
})

individualTests.forEach(function (test, i) {
  var filename = ['built', zeroFill(3, i)]
      .concat(test.nestedName)
      .join('-') + '.js'

  // file names with spaces are legal, but annoying to use w/ CLI commands
  filename = filename.replace(/\s/g, '_')

  // istanbul freaks out if the there are `'` characters in the file name
  filename = filename.replace(/'/g, '')

  // remove any illegal chars
  filename = sanitizeFilename(filename)

  fs.writeFileSync(path.join(testDir, filename), test.code)
})
