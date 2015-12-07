'use strict'

// Generates the test/fixtures/coverage.js file, not otherwise used in the
// tests.

var fs = require('fs')
var path = require('path')

var _ = require('lodash')
var rimraf = require('rimraf')
var sourceMapFixtures = require('source-map-fixtures')

var NYC = require('../../')

// Load source map fixtures.
var fixtures = {
  bundle: sourceMapFixtures.inline('bundle'),
  inline: sourceMapFixtures.inline('branching'),
  none: sourceMapFixtures.none('branching')
}

// Inject nyc into this process.
var nyc = (new NYC({
  cwd: path.join(__dirname, '..', '..')
})).wrap()
// Override the exclude option, source-map-fixtures is inside node_modules but
// should not be excluded when generating the coverage report.
nyc.exclude = []

// Require the fixture so nyc can instrument it, then run it so there's code
// coverage.
fixtures.bundle.require().branching()
fixtures.inline.require().run()
fixtures.none.require().run()

// Copy NYC#writeCoverageFile() behavior to get the coverage object, before
// source maps have been applied.
var coverage = global.__coverage__
if (typeof __coverage__ === 'object') coverage = __coverage__
if (!coverage) {
  console.error('No coverage.')
  process.exit(1)
}

var reports = _.values(coverage)
if (reports.length !== 3) {
  console.error('Expected 3 reports to be generated, got ' + reports.length)
  process.exit(1)
}

var out = fs.createWriteStream(path.join(__dirname, 'coverage.js'))
out.write('// Generated using node test/fixtures/_generateCoverage.js\n')
reports.forEach(function (coverage) {
  out.write('exports[' + JSON.stringify(coverage.path) + '] = ' + JSON.stringify(coverage, null, 2) + '\n')
})
out.end()
out.on('finish', function () {
  console.log('Written coverage report.')
})
