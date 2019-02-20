const singleton = require('./singleton-lib');

console.log(`start singleton-bin.js: ${singleton.read()}`);
singleton.write('sub-bin');
console.log(`singleton-bin.js wrote: ${singleton.read()}`);
