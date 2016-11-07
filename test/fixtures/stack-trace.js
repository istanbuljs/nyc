'use strict';

function blah() {
  throw new Error('Blarrh')
}

var stack;
try {
  blah();
} catch(err) {
  stack = err.stack;
}

module.exports = function() {
  return stack;
}
