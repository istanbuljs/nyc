if (process.env.xyz) {
  console.log('in t.js, xyz=%j', process.env.xyz)
  var Module = require('module')
  delete Module._cache[__filename]
  process.argv.splice(1, 1)
  process.argv[1] = require('path').resolve(process.argv[1])
  Module.runMain()
  console.error('ran wrapped main')
  return
}

var wrap = require('./index.js')

var unwrap = wrap([__filename], { xyz: 'ABC' })

var cp = require('child_process')
var child = cp.exec('tap -h', function (er, out, err) {
  console.error('returned')
  console.error('error = ', er)
  console.error('outlen=', out.length)
  console.error(out.split(/\n\n/)[0])
  console.error('errlen=', err.length)
  process.stderr.write(err)
})
