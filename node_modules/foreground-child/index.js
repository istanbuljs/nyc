var signalExit = require('signal-exit')
var spawn = require('win-spawn')

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

  var child = spawn(program, args, { stdio: 'inherit' })

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
