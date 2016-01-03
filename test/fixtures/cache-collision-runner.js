
var path = require('path')

var assert = require('assert')

var spawn = require('child_process').spawn

var time = process.hrtime()

var workerPath = path.join(__dirname, './cache-collision-worker.js')

function doFork (message) {
  spawn(process.execPath, [workerPath, String(time[0]), String(time[1]), message])
    .on('close', function (err) {
      assert.ifError(err)
    })
}

doFork('foo')
doFork('bar')
doFork('baz')
doFork('quz')
doFork('nada')
