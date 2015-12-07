/* global describe, it */

var _ = require('lodash')
var path = require('path')

var fixture = require('source-map-fixtures').inline('branching')
// Coverage for the fixture is stored relative to the root directory. Here
// compute the path to the fixture file relative to the root directory.
var relpath = './' + path.relative(path.join(__dirname, '..'), fixture.file)
// the sourcemap itself remaps the path.
var mappedPath = './' + path.relative(path.join(__dirname, '..'), fixture.sourceFile)
// Compute the number of lines in the original source, excluding any line break
// at the end of the file.
var maxLine = fixture.sourceContentSync().trimRight().split(/\r?\n/).length

var SourceMapCache = require('../lib/source-map-cache')
var sourceMapCache = new SourceMapCache()
sourceMapCache.add(relpath, fixture.contentSync())

var coverage = require('./fixtures/coverage')

require('chai').should()
require('tap').mochaGlobals()

describe('source-map-cache', function () {
  describe('statements', function () {
    it('drops statements that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[mappedPath].s)
        .should.be.lt(coverage[relpath].s)
      Object.keys(mappedCoverage[mappedPath].statementMap).length
        .should.equal(Object.keys(mappedCoverage[mappedPath].s).length)
    })

    it('maps all statements back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var statements = _.values(mappedCoverage[mappedPath].statementMap)
      var maxStatement = _.max(statements, function (s) {
        return Math.max(s.start.line, s.end.line)
      })
      Math.max(maxStatement.start.line, maxStatement.end.line).should.be.lte(maxLine)
    })
  })

  describe('functions', function () {
    it('drops functions that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[mappedPath].f)
        .should.be.lt(coverage[relpath].f)
      Object.keys(mappedCoverage[mappedPath].fnMap).length
        .should.equal(Object.keys(mappedCoverage[mappedPath].f).length)
    })

    it('maps all functions back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var functions = _.values(mappedCoverage[mappedPath].fnMap)
      var maxFunction = _.max(functions, function (f) {
        return f.line
      })
      Math.max(maxFunction.line).should.be.lte(maxLine)
    })
  })

  describe('branches', function () {
    it('drops branches that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage[mappedPath].b)
        .should.be.lt(coverage[relpath].b)
      Object.keys(mappedCoverage[mappedPath].branchMap).length
        .should.equal(Object.keys(mappedCoverage[mappedPath].b).length)
    })

    it('maps all branches back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var branches = _.values(mappedCoverage[mappedPath].branchMap)
      var maxBranch = _.max(branches, function (b) {
        return b.line
      })
      Math.max(maxBranch.line).should.be.lte(maxLine)
    })
  })
})
