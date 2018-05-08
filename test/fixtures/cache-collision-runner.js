
var path = require('path')

var assert = require('assert')

var spawn = require('child_process').spawn

var time = process.hrtime()

var workerPath = path.join(__dirname, './cache-collision-worker.js')

function doFork (message) {
  spawn(process.execPath, [workerPath, String(time[0]), String(time[1]), message])
    .on('close', function (code) {
      assert.equal(code, 0, 'received non-zero exit code ' + code)
    })
}

doFork('foo')
doFork('bar')
doFork('baz')
doFork('quz')
doFork('nada')
