'use strict'

// Generates the test/fixtures/coverage.js file, not otherwise used in the
// tests.

var fs = require('fs')
var path = require('path')

var _ = require('lodash')
var rimraf = require('rimraf')

var NYC = require('../../')

// Load the 'branching' source map fixture.
var fixture = require('source-map-fixtures').inline('branching')

// Prevent pollution from earlier nyc runs.
var tempDirectory = path.join(__dirname, '.nyc_output')
rimraf.sync(tempDirectory)

// Inject nyc into this process.
var nyc = (new NYC({
  cwd: path.join(__dirname, '..', '..'),
  tempDirectory: tempDirectory
})).wrap()
// Override the exclude option, source-map-fixtures is inside node_modules but
// should not be excluded when generating the coverage report.
nyc.exclude = []

// Require the fixture so nyc can instrument it, then run it so there's code
// coverage.
fixture.require().run()

// Write the coverage file so reports can be loaded.
nyc.writeCoverageFile()

var reports = _.values(nyc._loadReports()[0])
if (reports.length !== 1) {
  console.error('Expected 1 report to be generated, got ' + reports.length)
  process.exit(1)
}

var coverage = reports[0]
fs.writeFileSync(
  path.join(__dirname, 'coverage.js'),
  '// Generated using node test/fixtures/_generateCoverage.js\n' +
  'exports[' + JSON.stringify(coverage.path) + '] = ' + JSON.stringify(coverage, null, 2) + '\n')
console.log('Written coverage report.')
