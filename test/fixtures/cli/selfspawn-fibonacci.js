'use strict';
var cp = require('child_process');

var index = +process.argv[2] || 0
if (index <= 1) {
  console.log(0)
  return
}
if (index == 2) {
  console.log(1)
  return
}

function getFromChild(n, cb) {
  var proc = cp.spawn(process.execPath, [__filename, n])
  var stdout = ''
  proc.stdout.on('data', function (data) { stdout += data })
  proc.on('close', function () {
    cb(null, +stdout)
  })
  proc.on('error', cb)
}

getFromChild(index - 1, function(err, result1) {
  if (err) throw err
  getFromChild(index - 2, function(err, result2) {
    if (err) throw err
    console.log(result1 + result2)
  })
})
