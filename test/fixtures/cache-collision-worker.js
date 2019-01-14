const assert = require('assert')
const message = process.argv[2]

assert.strictEqual(require('./cache-collision-target')(message), message === 'nada' ? undefined :  'this is a ' + message)

//assert.strictEqual(process.env.NYC_CWD, __dirname)
