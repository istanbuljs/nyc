/* global describe, it */

var _ = require('lodash')
var path = require('path')

var sourceMapFixtures = require('source-map-fixtures')

// Load source map fixtures.
var covered = _.mapValues({
  bundle: sourceMapFixtures.inline('bundle'),
  inline: sourceMapFixtures.inline('branching'),
  none: sourceMapFixtures.none('branching')
}, function (fixture) {
  return _.assign({
    // Coverage for the fixture is stored relative to the root directory. Here
    // compute the path to the fixture file relative to the root directory.
    relpath: './' + path.relative(path.join(__dirname, '..'), fixture.file),
    // the sourcemap itself remaps the path.
    mappedPath: './' + path.relative(path.join(__dirname, '..'), fixture.sourceFile),
    // Compute the number of lines in the original source, excluding any line
    // break at the end of the file.
    maxLine: fixture.sourceContentSync().trimRight().split(/\r?\n/).length
  }, fixture)
})

var SourceMapCache = require('../lib/source-map-cache')
var sourceMapCache = new SourceMapCache()
_.forOwn(covered, function (fixture) {
  sourceMapCache.add(fixture.relpath, fixture.contentSync())
})

var coverage = require('./fixtures/coverage')
var fixture = covered.inline

require('chai').should()
require('tap').mochaGlobals()

describe('source-map-cache', function () {
  it('does not rewrite if there is no source map', function () {
    var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
    mappedCoverage[covered.none.relpath].should.eql(coverage[covered.none.relpath])
  })

  describe('path', function () {
    it('does not rewrite path if the source map has more than one source', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      mappedCoverage.should.have.property(covered.bundle.relpath)
      mappedCoverage[covered.bundle.relpath].should.not.eql(coverage[covered.bundle.relpath])
    })

    it('rewrites path if the source map exactly one source', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(_.pick(coverage, fixture.relpath))
      mappedCoverage.should.have.property(fixture.mappedPath)
    })
  })

  describe('statements', function () {
    it('drops statements that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[fixture.mappedPath].s)
        .should.be.lt(coverage[fixture.relpath].s)
      Object.keys(mappedCoverage[fixture.mappedPath].statementMap).length
        .should.equal(Object.keys(mappedCoverage[fixture.mappedPath].s).length)
    })

    it('maps all statements back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var statements = _.values(mappedCoverage[fixture.mappedPath].statementMap)
      var maxStatement = _.max(statements, function (s) {
        return Math.max(s.start.line, s.end.line)
      })
      Math.max(maxStatement.start.line, maxStatement.end.line).should.be.lte(fixture.maxLine)
    })
  })

  describe('functions', function () {
    it('drops functions that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[fixture.mappedPath].f)
        .should.be.lt(coverage[fixture.relpath].f)
      Object.keys(mappedCoverage[fixture.mappedPath].fnMap).length
        .should.equal(Object.keys(mappedCoverage[fixture.mappedPath].f).length)
    })

    it('maps all functions back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var functions = _.values(mappedCoverage[fixture.mappedPath].fnMap)
      var maxFunction = _.max(functions, function (f) {
        return f.line
      })
      Math.max(maxFunction.line).should.be.lte(fixture.maxLine)
    })
  })

  describe('branches', function () {
    it('drops branches that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[fixture.mappedPath].b)
        .should.be.lt(coverage[fixture.relpath].b)
      Object.keys(mappedCoverage[fixture.mappedPath].branchMap).length
        .should.equal(Object.keys(mappedCoverage[fixture.mappedPath].b).length)
    })

    it('maps all branches back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var branches = _.values(mappedCoverage[fixture.mappedPath].branchMap)
      var maxBranch = _.max(branches, function (b) {
        return b.line
      })
      Math.max(maxBranch.line).should.be.lte(fixture.maxLine)
    })
  })
})
