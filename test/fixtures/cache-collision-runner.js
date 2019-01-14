const path = require('path')
const assert = require('assert')
const {spawnSync} = require('child_process')
const time = process.hrtime()
const workerPath = path.join(__dirname, './cache-collision-worker.js')

function doFork (message) {
  const output = spawnSync(process.execPath, [workerPath, String(time[0]), String(time[1]), message])
  assert.equal(output.status, 0, 'received non-zero exit code ' + output.status)
}

doFork('foo')
doFork('bar')
doFork('baz')
doFork('quz')
doFork('nada')
