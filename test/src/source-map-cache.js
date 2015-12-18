/* global describe, it */

var _ = require('lodash')
var ap = require('any-path')
var path = require('path')

var convertSourceMap = require('convert-source-map')
var sourceMapFixtures = require('source-map-fixtures')

// Load source map fixtures.
var covered = _.mapValues({
  bundle: sourceMapFixtures.inline('bundle'),
  inline: sourceMapFixtures.inline('branching'),
  istanbulIgnore: sourceMapFixtures.inline('istanbul-ignore'),
  none: sourceMapFixtures.none('branching')
}, function (fixture) {
  return _.assign({
    // Coverage for the fixture is stored relative to the root directory. Here
    // compute the path to the fixture file relative to the root directory.
    relpath: './' + path.relative(path.join(__dirname, '../..'), fixture.file),
    // the sourcemap itself remaps the path.
    mappedPath: './' + path.relative(path.join(__dirname, '../..'), fixture.sourceFile),
    // Compute the number of lines in the original source, excluding any line
    // break at the end of the file.
    maxLine: fixture.sourceContentSync().trimRight().split(/\r?\n/).length
  }, fixture)
})

var SourceMapCache
try {
  SourceMapCache = require('../../lib/source-map-cache.covered.js')
  require('../../lib/self-coverage-helper.js')
} catch (e) {
  SourceMapCache = require('../../lib/source-map-cache')
}

var sourceMapCache = new SourceMapCache()
_.forOwn(covered, function (fixture) {
  var source = fixture.contentSync()
  var sourceMap = convertSourceMap.fromSource(source) || convertSourceMap.fromMapFileSource(source, fixture.relpath)
  if (sourceMap) {
    sourceMapCache.addMap(fixture.relpath, sourceMap.sourcemap)
  }
})

var getReport = function () {
  return _.cloneDeep(require('../fixtures/report'))
}
var coverage = ap(require('../fixtures/coverage'))
var fixture = covered.inline

require('chai').should()
require('tap').mochaGlobals()

describe('source-map-cache', function () {
  it('does not rewrite if there is no source map', function () {
    var report = getReport()
    sourceMapCache.applySourceMaps(report)
    report.should.have.property(covered.none.relpath)
  })

  it('retains /* istanbul ignore … */ results', function () {
    var report = getReport()
    sourceMapCache.applySourceMaps(report)
    report[covered.istanbulIgnore.mappedPath].statementMap['3'].should.have.property('skip', true)
  })

  describe('path', function () {
    it('does not rewrite path if the source map has more than one source', function () {
      var report = getReport()
      sourceMapCache.applySourceMaps(report)
      report.should.have.property(covered.bundle.relpath)
    })

    it('rewrites path if the source map exactly one source', function () {
      var report = _.pick(getReport(), fixture.relpath)
      sourceMapCache.applySourceMaps(report)
      report.should.not.have.property(fixture.relpath)
      report.should.have.property(fixture.mappedPath)
    })
  })

  describe('statements', function () {
    it('drops statements that have no mapping back to the original source code', function () {
      var report = getReport()
      var originalS = report[fixture.relpath].s
      sourceMapCache.applySourceMaps(report)
      Object.keys(report[fixture.mappedPath].s)
        .should.be.lt(originalS)
      Object.keys(report[fixture.mappedPath].statementMap).length
        .should.equal(Object.keys(report[fixture.mappedPath].s).length)
    })

    it('maps all statements back to their original loc', function () {
      var report = getReport()
      sourceMapCache.applySourceMaps(report)
      var statements = _.values(report[fixture.mappedPath].statementMap)
      var maxStatement = _.max(statements, function (s) {
        return Math.max(s.start.line, s.end.line)
      })
      Math.max(maxStatement.start.line, maxStatement.end.line).should.be.lte(fixture.maxLine)
    })
  })

  describe('functions', function () {
    it('drops functions that have no mapping back to the original source code', function () {
      var report = getReport()
      var originalF = report[fixture.relpath].f
      sourceMapCache.applySourceMaps(report)
      Object.keys(report[fixture.mappedPath].f)
        .should.be.lt(originalF)
      Object.keys(report[fixture.mappedPath].fnMap).length
        .should.equal(Object.keys(report[fixture.mappedPath].f).length)
    })

    it('maps all functions back to their original loc', function () {
      var report = getReport()
      sourceMapCache.applySourceMaps(report)
      var functions = _.values(report[fixture.mappedPath].fnMap)
      var maxFunction = _.max(functions, function (f) {
        return f.line
      })
      Math.max(maxFunction.line).should.be.lte(fixture.maxLine)
    })
  })

  describe('branches', function () {
    it('drops branches that have no mapping back to the original source code', function () {
      var report = getReport()
      var originalB = report[fixture.relpath].b
      sourceMapCache.applySourceMaps(report)
      Object.keys(report[fixture.mappedPath].b)
        .should.be.lt(originalB)
      Object.keys(report[fixture.mappedPath].branchMap).length
        .should.equal(Object.keys(report[fixture.mappedPath].b).length)
    })

    it('maps all branches back to their original loc', function () {
      var report = getReport()
      sourceMapCache.applySourceMaps(report)
      var branches = _.values(report[fixture.mappedPath].branchMap)
      var maxBranch = _.max(branches, function (b) {
        return b.line
      })
      Math.max(maxBranch.line).should.be.lte(fixture.maxLine)
    })
  })
})
