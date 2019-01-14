const assert = require('assert')
const path = require('path')
const spawn = require('child_process').spawn

const workerPath = path.join(__dirname, './cache-collision-worker.js')

function doFork (message) {
  spawn(process.execPath, [workerPath, message])
    .on('close', function (code) {
      assert.equal(code, 0, 'received non-zero exit code ' + code)
    })
}

doFork('foo')
doFork('bar')
doFork('baz')
doFork('quz')
doFork('nada')
