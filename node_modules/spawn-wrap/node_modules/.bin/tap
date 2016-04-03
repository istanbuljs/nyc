#!/usr/bin/env node
var args = process.argv.slice(2)

var fs = require('fs')
if (!args.length && process.stdin.isTTY) {
  console.error(usage())
  process.exit(1)
}

process.stdout.on('error', function (er) {
  if (er.code === 'EPIPE')
    process.exit()
  else
    throw er
})

// defaults
var nodeArgs = []

var spawn = require('child_process').spawn
var fg = require('foreground-child')
var signalExit = require('signal-exit')
var opener = require('opener')

var timeout = process.env.TAP_TIMEOUT || 30
// coverage tools run slow.
if (global.__coverage__)
  timeout = 240

var color = require('supports-color')
if (process.env.TAP_COLORS !== undefined)
  color = !!(+process.env.TAP_COLORS)
var reporter
var files = []
var bail = false
var saveFile = null

var singleFlags = {
  b: 'bail',
  B: 'no-bail',
  c: 'color',
  C: 'no-color',
  h: 'help',
  '?': 'help',
  v: 'version'
}
var singleOpts = {
  R: 'reporter',
  t: 'timeout',
  s: 'save'
}

// If we're running under Travis-CI with a Coveralls.io token,
// then it's a safe bet that we ought to output coverage.
var pipeToService = !!process.env.COVERALLS_REPO_TOKEN
  || !!process.env.CODECOV_TOKEN
var coverage = pipeToService

var coverageReport

var nycBin = require.resolve('nyc/bin/nyc.js')
var coverallsBin = require.resolve('coveralls/bin/coveralls.js')
var codecovBin = require.resolve('codecov.io/bin/codecov.io.js')

for (var i = 0; i < args.length; i++) {
  var arg = args[i]
  if (arg.charAt(0) !== '-' || arg === '-') {
    files.push(arg)
    continue
  }

  // short-flags
  if (arg.charAt(1) !== '-' && arg !== '-gc') {
    var expand = []
    for (var f = 1; f < arg.length; f++) {
      var fc = arg.charAt(f)
      var sf = singleFlags[fc]
      var so = singleOpts[fc]
      if (sf)
        expand.push('--' + sf)
      else if (so) {
        var soval = arg.slice(f + 1)
        if (soval.charAt(0) !== '=')
          soval = '=' + soval
        expand.push('--' + so + soval)
        f = arg.length
      } else if (arg !== '-' + fc) {
        expand.push('-' + fc)
      }
    }
    if (expand.length) {
      args.splice.apply(args, [i, 1].concat(expand))
      i --
      continue
    }
  }

  var key = arg
  var val = null
  if (key.match(/^--/) && arg.indexOf('=') !== -1) {
    var kv = arg.split('=')
    key = kv.shift()
    val = kv.join('=')
  }

  switch (key) {
    case '--help':
      return console.log(usage())

    case '--version':
      return console.log(require('../package.json').version)

    case '--__coverage__':
      // NYC will not wrap a module in node_modules.
      // So, we need to tell the child proc when it's been added.
      global.__coverage__ = global.__coverage__ || {}
      continue

    case '--coverage-report':
      coverageReport = val || args[++i]
      if (!coverageReport) {
        if (pipeToService)
          coverageReport = 'text-lcov'
        else
          coverageReport = 'text'
      }
      continue

    case '--no-cov': case '--no-coverage':
      coverage = false
      continue

    case '--cov': case '--coverage':
      coverage = true
      continue

    case '--save':
      val = val || args[++i]
      saveFile = val
      continue

    case '--reporter':
      val = val || args[++i]
      reporter = val
      continue

    case '--gc': case '-gc': case '--expose-gc':
      nodeArgs.push('--expose-gc')
      continue

    case '--strict':
      nodeArgs.push('--use_strict')
      continue

    case '--debug':
      nodeArgs.push('--debug')
      continue

    case '--debug-brk':
      nodeArgs.push('--debug-brk')
      continue

    case '--harmony':
      nodeArgs.push('--harmony')
      continue

    case '--color':
      color = true
      continue

    case '--no-color':
      color = false
      continue

    case '--timeout':
      val = val || args[++i]
      timeout = +val
      continue

    case '--bail':
      bail = true
      continue

    case '--no-bail':
      bail = false
      continue

    case '--':
      files = files.concat(args.slice(i + 1))
      i = args.length
      continue

    default:
      throw new Error('Unknown argument: ' + arg)
  }
}

// By definition, the next two blocks cannot be covered, becuase
// they are only relevant when coverage is turned off.
/* istanbul ignore if */
if (coverage && !global.__coverage__) {
  // Re-spawn with coverage
  var node = process.execPath
  var args = [nycBin].concat(
    '--silent',
    process.execArgv,
    process.argv.slice(1),
    '--__coverage__'
  )
  var child = fg(node, args)
  child.removeAllListeners('close')
  child.on('close', function (code, signal) {
    if (signal)
      return process.kill(process.pid, signal)
    if (code)
      return process.exit(code)
    args = [__filename, '--no-coverage', '--coverage-report']
    if (coverageReport)
      args.push(coverageReport)
    fg(node, args)
  })
  return
}

/* istanbul ignore if */
if (coverageReport && !global.__coverage__ && files.length === 0) {
  var node = process.execPath
  var args = [nycBin, 'report', '--reporter', coverageReport]
  var child

  // automatically hook into coveralls
  if (coverageReport === 'text-lcov' && pipeToService) {
    child = spawn(node, args)
    var covBin, covName

    if (process.env.COVERALLS_REPO_TOKEN) {
      covBin = coverallsBin
      covName = 'Coveralls'
    } else if (process.env.CODECOV_TOKEN) {
      covBin = codecovBin
      covName = 'Codecov'
    }

    var ca = spawn(node, [covBin], {
      stdio: [ 'pipe', 1, 2 ],
      env: process.env
    })
    child.stdout.pipe(ca.stdin)
    ca.on('close', function (code, signal) {
      if (signal)
        process.kill(process.pid, signal)
      else if (code)
        process.exit(code)
      else
        console.log('Successfully piped to ' + covName)
    })
    signalExit(function (code, signal) {
      child.kill('SIGHUP')
      ca.kill('SIGHUP')
    })
  } else {
    // otherwise just run the reporter
    var child = fg(node, args)
    if (coverageReport === 'lcov') {
      child.on('exit', function () {
        opener('coverage/lcov-report/index.html')
      })
    }
  }
  return
}

if (process.env.TAP === '1')
  reporter = 'tap'

// default to tap for non-tty envs
if (!reporter)
  reporter = color ? 'classic' : 'tap'

function usage () {
  return fs.readFileSync(__dirname + '/usage.txt', 'utf8')
    .split('@@REPORTERS@@')
    .join(getReporters())
}

function getReporters () {
  var types = require('tap-mocha-reporter').types
  types = types.reduce(function (str, t) {
    var ll = str.split('\n').pop().length + t.length
    if (ll < 40)
      return str + ' ' + t
    else
      return str + '\n' + t
  }, '').trim()
  var ind = '                              '
  return ind + types.split('\n').join('\n' + ind)
}

var isExe
if (process.platform == "win32") {
  // On windows, there is no good way to check that a file is executable
  isExe = function isExe () { return true }
} else {
  isExe = function isExe (stat) {
    var mod = stat.mode
    var uid = stat.uid
    var gid = stat.gid
    var u = parseInt('100', 8)
    var g = parseInt('010', 8)
    var o = parseInt('001', 8)
    var ug = u | g

    var ret = (mod & o)
        || (mod & g) && process.getgid && gid === process.getgid()
        || (mod & u) && process.getuid && uid === process.getuid()
        || (mod & ug) && process.getuid && 0 === process.getuid()

    return ret
  }
}

process.env.TAP_TIMEOUT = timeout
if (color)
  process.env.TAP_COLORS = 1
else
  process.env.TAP_COLORS = 0

if (bail)
  process.env.TAP_BAIL = '1'

var glob = require('glob')
files = files.reduce(function(acc, f) {
  if (f === '-') {
    acc.push(f)
    return acc
  }

  // glob claims patterns MUST not include any '\'s
  if (!/\\/.test(f)) {
    f = glob.sync(f) || f
  }
  return acc.concat(f)
}, [])

if (files.length === 0) {
  console.error('Reading TAP data from stdin (use "-" argument to suppress)')
  files.push('-')
}

var TMR = require('tap-mocha-reporter')
if (files.length === 1 && files[0] === '-') {
  // if we didn't specify any files, then just passthrough
  // to the reporter, so we don't get '/dev/stdin' in the suite list.
  // We have to pause() before piping to switch streams2 into old-mode
  process.stdin.pause()
  reporter = new TMR(reporter)
  process.stdin.pipe(reporter)
  process.stdin.resume()
  return
}

var saved = files
if (saveFile) {
  try {
    saved = fs.readFileSync(saveFile, 'utf8').trim().split('\n')
  } catch (er) {}
}

// At this point, we know we need to use the tap root,
// because there are 1 or more files to spawn.
var tap = require('../lib/root.js')
if (reporter !== 'tap') {
  tap.unpipe(process.stdout)
  reporter = new TMR(reporter)
  tap.pipe(reporter)
}

if (saveFile) {
  var fails = []
  tap.on('result', function (res) {
    // we will continue to re-run todo tests, even though they're
    // not technically "failures".
    if (!res.ok && !res.extra.skip) {
      fails.push(res.extra.file)
    }
  })

  tap.on('end', function () {
    if (!fails.length)
      try {
        fs.unlinkSync(saveFile)
      } catch (er) {}
    else
      try {
        fs.writeFileSync(saveFile, fails.join('\n')+'\n')
      } catch (er){}
  })
}

var doStdin = false
for (var i = 0; i < files.length; i++) {
  var file = files[i]
  if (saved.indexOf(file) === -1)
    continue

  // Pick up stdin after all the other files are handled.
  if (file === '-') {
    doStdin = true
    continue
  }

  var st = fs.statSync(files[i])
  var opt = {
    env: Object.keys(process.env).reduce(function (env, k) {
      if (!env[k])
        env[k] = process.env[k]
      return env
    }, {
      TAP: 1
    })
  }

  var extra = {}
  if (timeout)
    extra.timeout = timeout * 1000

  extra.file = file

  if (file.match(/\.js$/))
    tap.spawn(process.execPath, nodeArgs.concat(file), opt, file, extra)
  else if (st.isDirectory()) {
    files.push.apply(files, fs.readdirSync(file).map(function (f) {
      return file + '/' + f
    }))
  }
  else if (isExe(st))
    tap.spawn(files[i], [], opt, file, extra)
}

if (doStdin)
  tap.stdin()

tap.end()
