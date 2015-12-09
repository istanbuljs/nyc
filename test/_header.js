var _ = require('lodash')
var fs = require('fs')
var NYC = require('../')
var path = require('path')
var rimraf = require('rimraf')
var sinon = require('sinon')
var spawn = require('child_process').spawn

require('chai').should()
require('tap').mochaGlobals()

var fixtures = path.resolve(__dirname, './fixtures')

var istanbul = require('istanbul')
var configSpy = sinon.spy(istanbul.config, 'loadFile')
var instrumenterSpy = sinon.spy(istanbul, 'Instrumenter')

function writeYmlConfig () {
  fs.writeFileSync('./.istanbul.yml', 'instrumentation:\n\tpreserve-comments: true', 'utf-8')
}

function ymlAfterEach () {
  configSpy.reset()
  instrumenterSpy.reset()
  rimraf.sync('./.istanbul.yml')
}

function cwdAfterEach () {
  delete process.env.NYC_CWD
  rimraf.sync(path.resolve(fixtures, './.nyc_output'))
}

function testSignal (signal, done) {
  var nyc = (new NYC({
    cwd: process.cwd()
  })).wrap()

  var proc = spawn(process.execPath, ['./test/fixtures/' + signal + '.js'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })

  proc.on('close', function () {
    var reports = _.filter(nyc._loadReports(), function (report) {
      return report['./test/fixtures/' + signal + '.js']
    })
    reports.length.should.equal(1)
    return done()
  })
}