// sure would be nice if the class were exposed...
var cp = require('child_process')
var fs = require('fs')
var child = cp.spawn('echo', [])
var ChildProcess = child.constructor
var path = require('path')
var which = require('which')
var assert = require('assert')
child.kill('SIGKILL')

var shebangRe = new RegExp(
  '^#!' +
  '(?:(?:(?:\\/usr)?\\/bin\\/)?env (iojs|node))' + // $1 - env lookup
  '|' +
  '(.*\\/(?:iojs|node))' // $2 - absolute path
)

var wrapMain = require.resolve('./wrap-main.js')

var hasDashR = /^(1\.[6-9]|2)\./.test(process.version)

module.exports = wrap

function wrap (args, envs) {
  if (args)
    assert(Array.isArray(args), 'args must be array')
  else
    args = []

  var pairs = []
  if (envs) {
    assert.equal(typeof envs, 'object', 'envs must be object')
    pairs = Object.keys(envs).map(function (k) {
      return k + '=' + envs[k]
    })
  }

  var spawn = ChildProcess.prototype.spawn
  var exec = cp.exec

  var injectArgs = [wrapMain]
  injectArgs.push('--args=' + args.length)
  injectArgs.push.apply(injectArgs, args)

  injectArgs.push('--envs=' + pairs.length)
  pairs.forEach(function (k) {
    injectArgs.push(k)
  })

  injectArgs.push('--')

  var spliceArgs = [1, 0].concat(injectArgs)

  function unwrap () {
    ChildProcess.prototype.spawn = spawn
    cp.exec = exec
  }

  ChildProcess.prototype.spawn = function (options) {
    // TODO: Have to look up shebangs for spawn as well.

    if (options.file === process.execPath ||
        path.basename(options.file) === 'node' ||
        path.basename(options.file) === 'iojs') {
      options.args.splice.apply(options.args, spliceArgs)
      if (envs)
        options.envPairs.push.apply(options.envPairs, pairs)
    }

    return spawn.call(this, options)
  }

  cp.exec = function (command /*...*/) {
    var doWrap = false

    // if the first cmd is node, we definitely wrap
    var b = command.trim().split(/\s+/)
    var shebang = null
    var exe = b[0]
    if (path.basename(exe) === 'node' ||
        path.basename(exe) === 'iojs' ||
        exe === process.execPath) {
      doWrap = true
    } else {
      // might be a shebang.  Check for that.
      // no way to do this without sync i/o
      try {
        // TODO: this uses the *caller's* PATH environ, but in fact,
        // when the shell looks up the file to execute, it is using
        // the *callee's* PATH.  The 'which' module must be extended
        // to take a PATH as an argument.
        var resolved = which.sync(b[0])
        var fd = fs.openSync(resolved, 'r')
        var buf = new Buffer(1024)
        fs.readSync(fd, buf, 0, 1024)
        var chunk = buf.toString().split(/\n/)[0]
        console.error('shebang line', chunk)
        shebang = chunk.match(shebangRe)
        if (shebang)
          doWrap = true
      } catch (er) {
        console.error('exec shebang lookup failed', er)
        // oh well, not ours.
        try { fs.closeSync(fd) } catch (er) {}
        doWrap = false
      }
    }

    var args
    if (doWrap) {
      command = command.trim()
      var node = exe
      if (shebang) {
        node = shebang[1] || shebang[2] || process.execPath
        command = resolved + command.substr(exe.length)
      } else {
        command = command.substr(exe.length)
      }

      command = [node].concat(injectArgs.map(function (a) {
        return JSON.stringify(a)
      })).join(' ') + ' ' + command

      args = [ command ]
      for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i])
      }
      console.error('exec wrapped!', command)
    } else {
      args = arguments
    }

    console.error('wrapping', args)
    return exec.apply(cp, args)
  }

  return unwrap
}
