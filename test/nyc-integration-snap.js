const fs = require('fs')
const path = require('path')
const os = require('os')

const t = require('tap')
const makeDir = require('make-dir')
const pify = require('pify')
const _rimraf = require('rimraf')

const { runNYC, fixturesCLI } = require('./helpers/run-nyc')

const rimraf = pify(_rimraf)
const mkdtemp = pify(fs.mkdtemp)

const tempDirBase = path.resolve(__dirname, 'temp-dir-base')
const nycConfigJS = path.resolve(fixturesCLI, './nyc-config-js')
const nycrcDir = path.resolve(fixturesCLI, './nycrc')

makeDir.sync(tempDirBase)

if (process.env.TAP_SNAPSHOT !== '1') {
  t.jobs = os.cpus().length
}

t.beforeEach(function () {
  return mkdtemp(tempDirBase + '/').then(tempDir => {
    this.tempDir = tempDir
  })
})

t.afterEach(function () {
  return rimraf(this.tempDir)
})

t.tearDown(() => {
  return rimraf(tempDirBase)
})

function testSuccess (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 0)
    t.equal(stderr, '')
    t.matchSnapshot(stdout, 'stdout')
  })
}

function testFailure (t, opts) {
  opts.tempDir = t.tempDir
  return runNYC(opts).then(({ status, stderr, stdout }) => {
    t.equal(status, 1)
    t.matchSnapshot(stderr, 'stderr')
    t.matchSnapshot(stdout, 'stdout')
  })
}

t.test('--include can be used to limit bin to instrumenting specific files', t => testSuccess(t, {
  args: ['--all', '--include', 'half-covered.js', process.execPath, './half-covered.js']
}))

t.test('--exclude should allow default exclude rules to be overridden', t => testSuccess(t, {
  args: [
    '--all',
    '--exclude=**/half-covered.js',
    '--exclude=**/coverage',
    process.execPath,
    './half-covered.js'
  ]
}))

t.test('report and check should show coverage check along with report', t => {
  return testSuccess(t, {
    args: ['--silent', process.execPath, './half-covered.js']
  }).then(() => testFailure(t, {
    args: ['report', '--check-coverage', '--lines=100']
  }))
})

t.test('--ignore-class-method skips methods that match ignored name but still catches those that are not', t => testSuccess(t, {
  args: ['--all', '--ignore-class-method', 'skip', process.execPath, './classes.js']
}))

t.test('--check-coverage fails when the expected coverage is below a threshold', t => testFailure(t, {
  args: ['--check-coverage', '--lines', '51', process.execPath, './half-covered.js']
}))

// https://github.com/istanbuljs/nyc/issues/384
t.test('--check-coverage fails when check-coverage command is used rather than flag', t => {
  return testSuccess(t, {
    args: [process.execPath, './half-covered.js']
  }).then(() => testFailure(t, {
    args: ['check-coverage', '--lines', '51', process.execPath, './half-covered.js']
  }))
})

t.test('--check-coverage succeeds when the expected coverage is above a threshold', t => testSuccess(t, {
  args: ['--check-coverage', '--lines', '49', process.execPath, './half-covered.js']
}))

// https://github.com/bcoe/nyc/issues/209
t.test('--check-coverage fails in any case when the underlying test failed', t => testFailure(t, {
  args: ['--check-coverage', '--lines', '49', process.execPath, './half-covered-failing.js']
}))

t.test('--check-coverage fails when the expected file coverage is below a threshold', t => testFailure(t, {
  args: ['--check-coverage', '--lines', '51', '--per-file', process.execPath, './half-covered.js']
}))

t.test('passes configuration via environment variables', t => {
  return runNYC({
    tempDir: t.tempDir,
    leavePathSep: true,
    args: [
      '--silent',
      '--require=make-dir',
      '--include=env.js',
      '--exclude=batman.js',
      '--extension=.js',
      '--cache=false',
      '--cache-dir=/tmp',
      '--source-map=true',
      process.execPath,
      './env.js'
    ]
  }).then(({ stdout, stderr, status }) => {
    const checkOptions = [
      'instrumenter',
      'silent',
      'cacheDir',
      'cache',
      'sourceMap',
      'require',
      'include',
      'exclude',
      'extension'
    ]

    const { NYC_CONFIG } = JSON.parse(stdout)
    const config = JSON.parse(NYC_CONFIG, (key, value) => {
      return key === '' || checkOptions.includes(key) ? value : undefined
    })

    t.is(status, 0)
    t.is(stderr, '')
    t.matchSnapshot(config)
  })
})

t.test('allows package.json configuration to be overridden with command line args', t => testSuccess(t, {
  args: ['--reporter=text-lcov', process.execPath, './half-covered.js']
}))

t.test('loads configuration from package.json and nyc.config.js', t => testSuccess(t, {
  args: [process.execPath, './index.js'],
  cwd: nycConfigJS
}))

t.test('loads configuration from different module rather than nyc.config.js', t => testFailure(t, {
  args: ['--all', '--nycrc-path', './nycrc-config.js', process.execPath, './index.js'],
  cwd: nycConfigJS
}))

t.test('allows nyc.config.js configuration to be overridden with command line args', t => testSuccess(t, {
  args: ['--all', '--exclude=foo.js', process.execPath, './index.js'],
  cwd: nycConfigJS
}))

t.test('loads configuration from package.json and .nycrc', t => testSuccess(t, {
  args: [process.execPath, './index.js'],
  cwd: nycrcDir
}))

t.test('loads configuration from different file rather than .nycrc', t => testFailure(t, {
  args: ['--nycrc-path', './.nycrc-config.json', process.execPath, './index.js'],
  cwd: nycrcDir
}))

t.test('loads configuration from .nycrc.yml', t => testSuccess(t, {
  args: ['--nycrc-path', './.nycrc.yml', process.execPath, './index.js'],
  cwd: nycrcDir
}))

t.test('loads configuration from .nycrc.yaml', t => testSuccess(t, {
  args: ['--nycrc-path', './.nycrc.yaml', process.execPath, './index.js'],
  cwd: nycrcDir
}))

t.test('allows .nycrc configuration to be overridden with command line args', t => testSuccess(t, {
  args: ['--exclude=foo.js', process.execPath, './index.js'],
  cwd: nycrcDir
}))

t.test('reports appropriate coverage information for es6 source files', t => testSuccess(t, {
  args: ['--reporter=lcov', '--reporter=text', process.execPath, './es6.js']
}))

t.test('hooks provide coverage for requireJS and AMD modules', t => testSuccess(t, {
  args: [
    /* This effectively excludes ./index.js, normalizing results before/after node.js 11.11.0 */
    '--include=lib/**',
    '--hook-run-in-this-context',
    '--hook-require=false',
    process.execPath,
    './index.js'
  ],
  cwd: path.resolve(__dirname, './fixtures/hooks')
}))

t.test('does not interpret args intended for instrumented bin', t => testSuccess(t, {
  args: ['--silent', process.execPath, 'args.js', '--help', '--version']
}))

t.test('interprets first args after -- as Node.js execArgv', t => testSuccess(t, {
  args: ['--', '--expose-gc', path.resolve(fixturesCLI, 'gc.js')]
}))

t.test('--show-process-tree displays a tree of spawned processes', t => testSuccess(t, {
  args: ['--show-process-tree', process.execPath, 'selfspawn-fibonacci.js', '5']
}))
