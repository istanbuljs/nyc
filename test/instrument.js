'use strict'

const fs = require('../lib/fs-promises')
const path = require('path')
const { promisify } = require('util')

const t = require('tap')
const makeDir = require('make-dir')
const isWindows = require('is-windows')()
const rimraf = promisify(require('rimraf'))

const { runNYC, testSuccess, fixturesCLI } = require('./helpers')

const subdir = path.resolve(fixturesCLI, 'subdir')
const outputDir = path.resolve(subdir, './output-dir')
const removedByClean = path.resolve(outputDir, 'removed-by-clean')

function cleanup () {
  return Promise.all([
    rimraf(path.resolve(subdir, 'output-dir')),
    rimraf(path.resolve(fixturesCLI, 'output-dir'))
  ])
}

t.test('clean before', cleanup)
t.afterEach(cleanup)

t.test('works in directories without a package.json', async t => {
  const { status } = await runNYC({
    args: ['instrument', './input-dir', './output-dir'],
    cwd: subdir
  })

  t.strictEqual(status, 0)
  const target = path.resolve(subdir, 'output-dir', 'index.js')
  t.match(await fs.readFile(target, 'utf8'), /console.log\('Hello, World!'\)/)
})

t.test('can be configured to exit on error', async t => {
  const { status } = await runNYC({
    args: ['instrument', '--exit-on-error', './input-dir', './output-dir'],
    cwd: subdir
  })

  t.strictEqual(status, 1)
})

t.test('allows a single file to be instrumented', async t => {
  const inputPath = path.resolve(fixturesCLI, './half-covered.js')
  const inputMode = (await fs.stat(inputPath)).mode & 0o7777
  const newMode = 0o775
  if (!isWindows) {
    await fs.chmod(inputPath, newMode)
  }

  const { status } = await runNYC({
    args: ['instrument', './half-covered.js', outputDir]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictSame(files, ['half-covered.js'])

  if (!isWindows) {
    const outputPath = path.resolve(outputDir, 'half-covered.js')
    const outputMode = (await fs.stat(outputPath)).mode & 0o7777
    t.strictEqual(outputMode, newMode)

    await fs.chmod(inputPath, inputMode)
  }
})

t.test('allows a directory of files to be instrumented', async t => {
  const { status } = await runNYC({
    args: ['instrument', './nyc-config-js', outputDir]
  })

  t.strictEqual(status, 0)

  const files = fs.readdirSync(outputDir)
  t.strictEqual(files.includes('index.js'), true)
  t.strictEqual(files.includes('ignore.js'), true)
  t.strictEqual(files.includes('package.json'), false)
  t.strictEqual(files.includes('node_modules'), false)

  const includeTarget = path.resolve(outputDir, 'ignore.js')
  t.match(await fs.readFile(includeTarget, 'utf8'), /function cov_/)
})

t.test('copies all files from <input> to <output> as well as those that have been instrumented', async t => {
  // force node_modules to exist so we can verify that it is copied.
  const nmDir = path.resolve(fixturesCLI, 'nyc-config-js', 'node_modules')
  await makeDir(nmDir)
  await fs.writeFile(path.join(nmDir, 'test-file'), '')

  const { status } = await runNYC({
    args: ['instrument', '--complete-copy', './nyc-config-js', outputDir]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('index.js'), true)
  t.strictEqual(files.includes('ignore.js'), true)
  t.strictEqual(files.includes('package.json'), true)
  t.strictEqual(files.includes('node_modules'), true)

  const includeTarget = path.resolve(outputDir, 'ignore.js')
  t.match(await fs.readFile(includeTarget, 'utf8'), /function cov_/)
})

t.test('can instrument the project directory', async t => {
  const { status } = await runNYC({
    args: ['instrument', '.', outputDir]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('args.js'), true)
  t.strictEqual(files.includes('subdir'), true)
})

t.test('allows a sub-directory of files to be instrumented', async t => {
  const { status } = await runNYC({
    args: ['instrument', './subdir/input-dir', outputDir]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('index.js'), true)
})

t.test('allows a subdirectory to be excluded via .nycrc file', async t => {
  const { status } = await runNYC({
    args: [
      'instrument',
      '--nycrc-path',
      './.instrument-nycrc',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = fs.readdirSync(outputDir)
  t.strictEqual(files.includes('exclude-me'), true)
  t.strictEqual(files.includes('node_modules'), true)
  t.strictEqual(files.includes('index.js'), true)
  t.strictEqual(files.includes('bad.js'), true)

  const includeTarget = path.resolve(outputDir, 'index.js')
  t.match(await fs.readFile(includeTarget, 'utf8'), /function cov_/)

  const excludeTarget = path.resolve(outputDir, 'exclude-me', 'index.js')
  t.notMatch(await fs.readFile(excludeTarget, 'utf8'), /function cov_/)
})

t.test('allows a file to be excluded', async t => {
  const { status } = await runNYC({
    args: [
      'instrument',
      '--complete-copy',
      '--exclude',
      'exclude-me/index.js',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('exclude-me'), true)

  const excludeTarget = path.resolve(outputDir, 'exclude-me', 'index.js')
  t.notMatch(await fs.readFile(excludeTarget, 'utf8'), /function cov_/)
})

t.test('allows specifying a single sub-directory to be included', async t => {
  const { status } = await runNYC({
    args: [
      'instrument',
      '--include',
      '**/include-me/**',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('include-me'), true)
  const instrumented = path.resolve(outputDir, 'include-me', 'include-me.js')
  t.match(await fs.readFile(instrumented, 'utf8'), /function cov_/)
})

t.test('allows a file to be excluded from an included directory', async t => {
  const { status } = await runNYC({
    args: [
      'instrument',
      '--complete-copy',
      '--exclude',
      '**/exclude-me.js',
      '--include',
      '**/include-me/**',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('include-me'), true)

  const includeMeFiles = await fs.readdir(path.resolve(outputDir, 'include-me'))
  t.strictEqual(includeMeFiles.includes('include-me.js'), true)
  t.strictEqual(includeMeFiles.includes('exclude-me.js'), true)

  const includeTarget = path.resolve(outputDir, 'include-me', 'include-me.js')
  t.match(await fs.readFile(includeTarget, 'utf8'), /function cov_/)

  const excludeTarget = path.resolve(outputDir, 'exclude-me', 'index.js')
  t.notMatch(await fs.readFile(excludeTarget, 'utf8'), /function cov_/)
})

t.test('aborts if trying to write files in place', async t => {
  const { status, stderr } = await runNYC({
    args: ['instrument', './', './']
  })

  t.strictEqual(status, 1)
  t.match(stderr, /cannot instrument files in place/)
})

t.test('can write files in place with --in-place switch', async t => {
  const sourceDir = path.resolve(fixturesCLI, 'instrument-inplace')
  await makeDir(outputDir)
  await Promise.all(['package.json', 'file1.js', 'file2.js'].map(
    file => fs.copyFile(path.join(sourceDir, file), path.join(outputDir, file))
  ))

  const { status } = await runNYC({
    args: [
      'instrument',
      '--in-place',
      '--include',
      'file1.js',
      '.'
    ],
    cwd: outputDir
  })

  t.strictEqual(status, 0)

  const file1 = path.resolve(outputDir, 'file1.js')
  t.match(await fs.readFile(file1, 'utf8'), /function cov_/)

  const file2 = path.resolve(outputDir, 'file2.js')
  t.notMatch(await fs.readFile(file2, 'utf8'), /function cov_/)

  await testSuccess(t, {
    args: ['--all', process.execPath, '-e', ''],
    cwd: outputDir
  })
})

t.test('aborts if trying to delete while writing files in place', async t => {
  const { status, stderr } = await runNYC({
    args: [
      'instrument',
      '--in-place',
      '--delete',
      '--include',
      'file1.js',
      './instrument-inplace'
    ]
  })

  t.strictEqual(status, 1)
  t.match(stderr, /cannot use '--delete' when instrumenting files in place/)
})

t.test('aborts if trying to instrument files from outside the project root directory', async t => {
  const { status, stderr } = await runNYC({
    args: [
      'instrument',
      '--delete',
      '../',
      './'
    ]
  })

  t.strictEqual(status, 1)
  t.match(stderr, /cannot instrument files outside project root directory/)
})

t.test('cleans the output directory if `--delete` is specified', async t => {
  await makeDir(removedByClean)
  const { status } = await runNYC({
    args: [
      'instrument',
      '--delete',
      'true',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('removed-by-clean'), false)
  t.strictEqual(files.includes('exclude-me'), true)
})

t.test('does not clean the output directory by default', async t => {
  await makeDir(removedByClean)

  const { status } = await runNYC({
    args: [
      'instrument',
      './subdir/input-dir',
      outputDir
    ]
  })

  t.strictEqual(status, 0)

  const files = await fs.readdir(outputDir)
  t.strictEqual(files.includes('removed-by-clean'), true)
})

t.test('aborts if trying to clean process.cwd()', async t => {
  const { status, stderr } = await runNYC({
    args: ['instrument', '--delete', './src', './']
  })

  t.strictEqual(status, 1)
  t.match(stderr, /attempt to delete/)
})

t.test('aborts if trying to clean outside working directory', async t => {
  const { status, stderr } = await runNYC({
    args: ['instrument', '--delete', './', '../']
  })

  t.strictEqual(status, 1)
  t.match(stderr, /attempt to delete/)
})
