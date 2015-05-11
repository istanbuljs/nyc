/* global describe, it, afterEach */

require('chai').should()

var NYC = require('../'),
  path = require('path')

describe('nyc', function () {
  describe('cwd', function () {
    afterEach(function () {
      delete process.env.NYC_CWD
    })
/*
    it('sets cwd to process.cwd() if no environment variable set', function () {
      var nyc = new NYC()

      nyc.cwd.should.eql(process.cwd())
    })*/

    it('uses NYC_CWD environment variable for cwd if it is set', function () {
      process.env.NYC_CWD = path.resolve(__dirname, './fixtures')

      var nyc = new NYC()

      nyc.cwd.should.match(/nyc\/test\/fixtures/)
    })
  })

  describe('exclude', function () {
    it('loads exclude patterns from package.json in cwd', function () {
      var nyc = new NYC()

      nyc.exclude.length.should.eql(1)
    })
  })

  /*describe('wrapSpawn', function () {

  })*/

  describe('wrapRequire', function () {
    it('uses istanbul to wrap modules when required', function () {
      (new NYC()).wrapRequire()

      var A = require('./fixtures/a')
      A.should.match(/__cov_/)
    })
  })

  describe('report', function () {
  })
})
