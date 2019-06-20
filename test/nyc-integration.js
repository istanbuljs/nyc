'use strict'

const path = require('path')
const fs = require('fs')
const os = require('os')

const t = require('tap')
const glob = require('glob')
const rimraf = require('rimraf')

const { fixturesCLI, runNYC, tempDirSetup, testSuccess, testFailure, envCheckConfig } = require('./helpers')

const nycConfigJS = path.resolve(fixturesCLI, 'nyc-config-js')
const nycrcDir = path.resolve(fixturesCLI, 'nycrc')
const fixturesSourceMaps = path.resolve(fixturesCLI, '../source-maps')
const fixturesENM = path.resolve(fixturesCLI, '../exclude-node-modules')

const executeNodeModulesArgs = [
  '--all=true',
  '--cache=false',
  '--per-file=true',
  '--exclude-node-modules=false',
  '--include=node_modules/@istanbuljs/fake-module-1/**'
]

t.jobs = os.cpus().length

tempDirSetup(t, __filename)

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
t.test('check-coverage command is equivalent to the flag', t => {
  return testSuccess(t, {
    args: [process.execPath, './half-covered.js']
  }).then(() => testFailure(t, {
    args: ['check-coverage', '--lines', '51']
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

t.test('passes configuration via environment variables', t => envCheckConfig(t, {
  configArgs: [
    '--silent',
    '--require=make-dir',
    '--include=env.js',
    '--exclude=batman.js',
    '--extension=.js',
    '--cache=false',
    '--cache-dir=/tmp',
    '--source-map=true'
  ],
  checkOptions: [
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
}))

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

t.test('does not interpret args intended for instrumented bin', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: ['--silent', process.execPath, 'args.js', '--help', '--version'],
    leavePathSep: true
  }).then(({ status, stderr, stdout }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.matchSnapshot(JSON.parse(stdout).slice(2))
  })
})

t.test('interprets first args after -- as Node.js execArgv', t => testSuccess(t, {
  args: ['--', '--expose-gc', path.resolve(fixturesCLI, 'gc.js')]
}))

t.test('--show-process-tree displays a tree of spawned processes', t => testSuccess(t, {
  args: ['--show-process-tree', process.execPath, 'selfspawn-fibonacci.js', '5']
}))

t.test('can run "npm test" which directly invokes a test file', t => testSuccess(t, {
  args: ['npm', 'test'],
  cwd: path.resolve(fixturesCLI, 'run-npm-test')
}))

t.test('can run "npm test" which indirectly invokes a test file', t => testSuccess(t, {
  args: ['npm', 'test'],
  cwd: path.resolve(fixturesCLI, 'run-npm-test-recursive')
}))

t.test('nyc instrument single file to console', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: ['instrument', './half-covered.js']
  }).then(({ status, stderr, originalText }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.match(originalText.stdout, `path:${JSON.stringify(path.resolve(fixturesCLI, 'half-covered.js'))}`)
  })
})

t.test('nyc instrument a directory of files', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: ['instrument', './']
  }).then(({ status, stderr, originalText }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.match(originalText.stdout, `path:${JSON.stringify(path.resolve(fixturesCLI, 'half-covered.js'))}`)
    t.match(originalText.stdout, `path:${JSON.stringify(path.resolve(fixturesCLI, 'half-covered-failing.js'))}`)
    t.notMatch(originalText.stdout, `path:${JSON.stringify(path.resolve(fixturesCLI, 'test.js'))}`)
  })
})

t.test('nyc instrument returns unmodified source if there is no transform', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: ['instrument', './no-transform/half-covered.xjs']
  }).then(({ status, stderr, stdout }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.match(stdout, 'var a = 0')
    t.notMatch(stdout, 'cov_')
  })
})

t.test('nyc instrument on file with `package` keyword when es-modules is disabled', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: ['instrument', '--no-es-modules', './not-strict.js']
  }).then(({ status, stderr, originalText }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.match(originalText.stdout, `path:${JSON.stringify(path.resolve(fixturesCLI, 'not-strict.js'))}`)
  })
})

t.test('nyc instrument fails on file with `package` keyword when es-modules is enabled', t => testFailure(t, {
  args: ['instrument', '--exit-on-error', './not-strict.js']
}))

t.test('nyc displays help to stderr when it doesn\'t know what to do', t => {
  let helpmsg

  return runNYC({
    tempDir: t.tempDir,
    args: ['--help']
  }).then(({ status, stderr, stdout }) => {
    t.is(status, 0)
    t.is(stderr, '')
    helpmsg = stdout
  }).then(() => runNYC({
    tempDir: t.tempDir,
    args: []
  })).then(({ status, stderr, stdout }) => {
    t.equal(status, 1)
    t.equal(stdout, '')
    t.equal(stderr, helpmsg)
  })
})

t.test('handles --clean / --no-clean properly', t => {
  return testSuccess(t, {
    args: [
      '--clean',
      process.execPath,
      './by-arg2.js',
      '1'
    ]
  }).then(() => testSuccess(t, {
    args: [
      '--no-clean',
      process.execPath,
      './by-arg2.js',
      '2'
    ]
  }))
})

t.test('setting instrument to "false" configures noop instrumenter', t => envCheckConfig(t, {
  configArgs: [
    '--silent',
    '--no-instrument',
    '--no-source-map'
  ],
  checkOptions: [
    'silent',
    'instrument',
    'sourceMap',
    'instrumenter'
  ]
}))

t.test('extracts coverage headers from unexecuted files', t => {
  return envCheckConfig(t, {
    configArgs: [
      '--all',
      '--silent',
      '--no-instrument',
      '--no-source-map'
    ],
    checkOptions: [
      'all',
      'silent',
      'instrument',
      'sourceMap',
      'instrumenter'
    ]
  }).then(() => new Promise((resolve, reject) => {
    glob(path.join(t.tempDir, '*.json'), (err, files) => {
      if (err) {
        return reject(err)
      }

      resolve(files)
    })
  })).then(files => {
    const coverage = files.reduce(
      (obj, file) => Object.assign(obj, JSON.parse(fs.readFileSync(file, 'utf-8'))),
      {}
    )

    // we should not have executed file, so all counts sould be 0.
    const data = coverage['./external-instrumenter.js']
    t.type(data, 'object')

    t.false(Object.keys(data.s).some(k => data.s[k] !== 0))
  })
})

t.test('allows an alternative cache folder to be specified', t => {
  const cacheDir = path.resolve(fixturesCLI, 'foo-cache')

  return testSuccess(t, {
    args: [
      `--cache-dir=${cacheDir}`,
      '--cache=true',
      process.execPath,
      './half-covered.js'
    ]
  }).then(() => {
    // we should have created foo-cache rather
    // than the default ./node_modules/.cache.
    t.is(1, fs.readdirSync(cacheDir).length)

    rimraf.sync(cacheDir)
  })
})

// see: https://github.com/istanbuljs/nyc/issues/563
t.test('does not create .cache folder if cache is "false"', t => {
  const cacheDir = path.resolve(fixturesCLI, './disabled-cache')

  return testSuccess(t, {
    args: [
      `--cache-dir=${cacheDir}`,
      '--cache=false',
      process.execPath,
      './half-covered.js'
    ]
  }).then(() => {
    t.false(fs.existsSync(cacheDir))
  })
})

t.test('allows alternative high and low watermarks to be configured', t => testSuccess(t, {
  args: [
    '--watermarks.lines=90',
    '--watermarks.lines=100',
    '--watermarks.statements=30',
    '--watermarks.statements=40',
    '--cache=true',
    process.execPath,
    './half-covered.js'
  ],
  env: {
    FORCE_COLOR: true
  }
}))

t.test('--all includes files with both .map files and inline source-maps', t => testSuccess(t, {
  args: [
    '--all',
    '--cache=false',
    '--exclude-after-remap=false',
    '--exclude=original',
    process.execPath,
    './instrumented/s1.min.js'
  ],
  cwd: fixturesSourceMaps
}))

t.test('--all uses source-maps to exclude original sources from reports', t => testSuccess(t, {
  args: [
    '--all',
    '--cache=false',
    '--exclude=original/s1.js',
    process.execPath,
    './instrumented/s1.min.js'
  ],
  cwd: fixturesSourceMaps
}))

t.test('appropriately instruments file with corresponding .map file', t => testSuccess(t, {
  args: [
    '--cache=false',
    '--exclude-after-remap=false',
    '--exclude=original',
    process.execPath,
    './instrumented/s1.min.js'
  ],
  cwd: fixturesSourceMaps
}))

t.test('appropriately instruments file with inline source-map', t => testSuccess(t, {
  args: [
    '--cache=false',
    '--exclude-after-remap=false',
    '--exclude=original',
    process.execPath,
    './instrumented/s2.min.js'
  ],
  cwd: fixturesSourceMaps
}))

t.test('skip-empty does not display 0-line files', t => testSuccess(t, {
  args: [
    '--cache=false',
    '--skip-empty=true',
    process.execPath,
    './empty.js'
  ]
}))

t.test('skip-full does not display files with 100% statement, branch, and function coverage', t => testSuccess(t, {
  args: [
    '--skip-full',
    process.execPath,
    './skip-full.js'
  ]
}))

t.test('allows reserved word when es-modules is disabled', t => testSuccess(t, {
  args: [
    '--cache=false',
    '--es-modules=false',
    process.execPath,
    './not-strict.js'
  ]
}))

t.test('forbids reserved word when es-modules is not disabled', t => testFailure(t, {
  args: [
    '--cache=false',
    '--exit-on-error=true',
    process.execPath,
    './not-strict.js'
  ]
}))

t.test('execute with exclude-node-modules=false', t => {
  return testFailure(t, {
    args: [
      ...executeNodeModulesArgs,
      '--check-coverage=true',
      process.execPath,
      './bin/do-nothing.js'
    ],
    cwd: fixturesENM
  }).then(() => testFailure(t, {
    args: [
      ...executeNodeModulesArgs,
      '--check-coverage=true',
      'report'
    ],
    cwd: fixturesENM
  })).then(() => testFailure(t, {
    args: [
      ...executeNodeModulesArgs,
      'check-coverage'
    ],
    cwd: fixturesENM
  }))
})

t.test('instrument with exclude-node-modules=false', t => {
  return runNYC({
    tempDir: t.tempDir,
    args: [
      ...executeNodeModulesArgs,
      'instrument',
      'node_modules'
    ],
    cwd: fixturesENM
  }).then(({ status, stderr, stdout }) => {
    t.is(status, 0)
    t.is(stderr, '')
    t.match(stdout, 'fake-module-1')
  })
})
