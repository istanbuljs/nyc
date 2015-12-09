'use strict'
var path = require('path')
var fs = require('fs')
var parseFunction = require('parse-function');

var tests = []

function makeDescribe(stack) {
  stack = (stack && stack.slice()) || []

  return function (name, fn) {
    var newStack = stack.concat([name])
    var oldDescribe = global.describe
    var oldIt = global.it
    global.describe = makeDescribe(newStack)
    global.it = makeIt(newStack)
    try {
      fn()
    } finally {
      global.describe = oldDescribe
      global.it = oldIt
    }
  }
}

function makeIt(stack) {
  stack = (stack && stack.slice()) || []
  return function (name, test) {
    var obj = parseFunction(test)
    obj.stack = stack.concat([name])
    tests.push(obj)
  }
}

global.describe = makeDescribe()

require('./nyc-test')

var headerPath = path.join(__dirname, '_header.js')
var header = fs.readFileSync(headerPath, 'utf8')

var i = 1;
tests.forEach(function (test) {
  var testname = test.stack.join(' ')
  var filename = testname.replace(/\s/g, '-') + '.js';
  filename = i + filename;
  if (i < 100) {
    filename = (i < 10 ? '00' : '0') + filename;
  }
  filename = 'built-' + filename;
  filename = path.join(__dirname, filename);
  i++;
  var source = header + '\ndescribe("' + testname + '", function() {\n  it("test", ' +
    'function (' + test.params + ') {\n' +
      // 'rimraf.sync(path.resolve(fixtures, \'./nyc_output\'))\n' +
      test.body + '\n' +
      '})\n})';

  fs.writeFileSync(filename, source)
})
