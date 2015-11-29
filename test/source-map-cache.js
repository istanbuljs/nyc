/* global describe, it */

var _ = require('lodash')
var fs = require('fs')

var coverage = JSON.parse(fs.readFileSync('./test/fixtures/coverage-to-map.json', 'utf-8'))
var SourceMapCache = require('../lib/source-map-cache')
var sourceMapCache = new SourceMapCache()
sourceMapCache.add('./test/fixtures/es6-not-loaded.js', fs.readFileSync('./test/fixtures/code-with-map.js', 'utf-8'))

require('chai').should()
require('tap').mochaGlobals()

// Note: original source code was 20 lines of es6
// compiled code is 31 lines of es5 code.
describe('source-map-cache', function () {
  describe('statements', function () {
    it('drops statements that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].s).should.be.lt(
        coverage['./test/fixtures/es6-not-loaded.js'].s
      )
      Object.keys(
        mappedCoverage['./test/fixtures/es6-not-loaded.js'].statementMap
      ).length.should.equal(
        Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].s).length
      )
    })

    it('maps all statements back to their original loc', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var statements = _.values(mappedCoverage['./test/fixtures/es6-not-loaded.js'].statementMap)
      var maxStatement = _.max(statements, function (s) {
        return Math.max(s.start.line, s.end.line)
      })
      Math.max(maxStatement.start.line, maxStatement.end.line).should.be.lte(20)
    })
  })

  describe('functions', function () {
    it('drops functions that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].f).should.be.lt(
        coverage['./test/fixtures/es6-not-loaded.js'].f
      )
      Object.keys(
        mappedCoverage['./test/fixtures/es6-not-loaded.js'].fnMap
      ).length.should.equal(
        Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].f).length
      )
    })

    it('maps all functions back to their original loc', function () {
      var coverage = JSON.parse(fs.readFileSync('./test/fixtures/coverage-to-map.json', 'utf-8'))
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var functions = _.values(mappedCoverage['./test/fixtures/es6-not-loaded.js'].fnMap)
      var maxFunction = _.max(functions, function (f) {
        return f.line
      })
      Math.max(maxFunction.line).should.be.lte(20)
    })
  })

  describe('branches', function () {
    it('drops branches that have no mapping back to the original source code', function () {
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].b).should.be.lt(
        coverage['./test/fixtures/es6-not-loaded.js'].b
      )
      Object.keys(
        mappedCoverage['./test/fixtures/es6-not-loaded.js'].branchMap
      ).length.should.equal(
        Object.keys(mappedCoverage['./test/fixtures/es6-not-loaded.js'].b).length
      )
    })

    it('maps all branches back to their original loc', function () {
      var coverage = JSON.parse(fs.readFileSync('./test/fixtures/coverage-to-map.json', 'utf-8'))
      var mappedCoverage = sourceMapCache.applySourceMaps(coverage)
      var branches = _.values(mappedCoverage['./test/fixtures/es6-not-loaded.js'].branchMap)
      var maxBranch = _.max(branches, function (b) {
        return b.line
      })
      Math.max(maxBranch.line).should.be.lte(20)
    })
  })
})
