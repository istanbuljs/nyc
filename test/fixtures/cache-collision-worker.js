
var assert = require('assert')

var start = [
  parseInt(process.argv[2], 10),
  parseInt(process.argv[3], 10)
]

var message = process.argv[4]

var diff = process.hrtime(start)

while (diff[0] * 1e9 + diff[1] < 3e9) {
  diff = process.hrtime(start)
}


assert.strictEqual(require('./cache-collision-target')(message), message === 'nada' ? undefined :  'this is a ' + message)

//assert.strictEqual(process.env.NYC_CWD, __dirname)
