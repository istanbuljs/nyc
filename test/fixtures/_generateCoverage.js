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

// Inject nyc into this process.
var nyc = (new NYC({
  cwd: path.join(__dirname, '..', '..')
})).wrap()
// Override the exclude option, source-map-fixtures is inside node_modules but
// should not be excluded when generating the coverage report.
nyc.exclude = []

// Require the fixture so nyc can instrument it, then run it so there's code
// coverage.
fixture.require().run()

// Copy NYC#writeCoverageFile() behavior to get the coverage object, before
// source maps have been applied.
var coverage = global.__coverage__
if (typeof __coverage__ === 'object') coverage = __coverage__
if (!coverage) {
  console.error('No coverage.')
  process.exit(1)
}

var reports = _.values(coverage)
if (reports.length !== 1) {
  console.error('Expected 1 report to be generated, got ' + reports.length)
  process.exit(1)
}

fs.writeFileSync(
  path.join(__dirname, 'coverage.js'),
  '// Generated using node test/fixtures/_generateCoverage.js\n' +
  'exports[' + JSON.stringify(reports[0].path) + '] = ' + JSON.stringify(reports[0], null, 2) + '\n')
  console.log('Written coverage report.')
