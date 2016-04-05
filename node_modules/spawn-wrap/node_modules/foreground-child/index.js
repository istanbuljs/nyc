var signalExit = require('signal-exit')
var spawn = require('child_process').spawn
var crossSpawn = require('cross-spawn-async')
var fs = require('fs')
var which = require('which')

function needsCrossSpawn (exe) {
  if (process.platform !== 'win32') {
    return false
  }

  try {
    exe = which.sync(exe)
  } catch (er) {
    // failure to find the file?  cmd probably needed.
    return true
  }

  if (/\.(com|cmd|bat)$/i.test(exe)) {
    // need cmd.exe to run command and batch files
    return true
  }

  var buffer = new Buffer(150)
  try {
    var fd = fs.openSync(exe, 'r')
    fs.readSync(fd, buffer, 0, 150, 0)
  } catch (e) {
    // If it's not an actual file, probably it needs cmd.exe.
    // also, would be unsafe to test arbitrary memory on next line!
    return true
  }

  return /\#\!(.+)/i.test(buffer.toString().trim())
}

module.exports = function (program, args, cb) {
  var arrayIndex = arguments.length

  if (typeof args === 'function') {
    cb = args
    args = undefined
  } else {
    cb = Array.prototype.slice.call(arguments).filter(function (arg, i) {
      if (typeof arg === 'function') {
        arrayIndex = i
        return true
      }
    })[0]
  }

  cb = cb || function (done) {
    return done()
  }

  if (Array.isArray(program)) {
    args = program.slice(1)
    program = program[0]
  } else if (!Array.isArray(args)) {
    args = [].slice.call(arguments, 1, arrayIndex)
  }

  var spawnfn = needsCrossSpawn(program) ? crossSpawn : spawn
  var child = spawnfn(program, args, { stdio: 'inherit' })

  var childExited = false
  signalExit(function (code, signal) {
    child.kill(signal || 'SIGHUP')
  })

  child.on('close', function (code, signal) {
    cb(function () {
      childExited = true
      if (signal) {
        // If there is nothing else keeping the event loop alive,
        // then there's a race between a graceful exit and getting
        // the signal to this process.  Put this timeout here to
        // make sure we're still alive to get the signal, and thus
        // exit with the intended signal code.
        setTimeout(function () {}, 200)
        process.kill(process.pid, signal)
      } else
        process.exit(code)
    })
  })

  return child
}
