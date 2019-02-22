const path = require('path')
const { promisify } = require('util')
const fs = require('fs')
const istanbul = require('istanbul-lib-instrument')
const makeDir = require('make-dir')
const glob = promisify(require('glob'))

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const instrumenter = istanbul.createInstrumenter({
  coverageVariable: '___NYC_SELF_COVERAGE___',
  esModules: true
})

async function instrumentFile (name) {
  const indexPath = path.join(__dirname, name)
  const outputPath = path.join(__dirname, 'self-coverage', name)
  const outputDir = makeDir(path.dirname(outputPath))

  const source = await readFile(indexPath, 'utf8')
  const instrumentedSource = name === 'package.json' ? source : instrumenter.instrumentSync(source, indexPath)

  await outputDir
  await writeFile(outputPath, instrumentedSource)
}

async function instrumentGlob (pattern) {
  const result = await glob(pattern, {
    cwd: __dirname,
    nodir: true
  })

  await Promise.all(result.map(instrumentFile))
}

function instrumentAll () {
  const globPatterns = ['package.json', 'index.js', 'bin/*.js', 'lib/**/*.js']

  return Promise.all(globPatterns.map(instrumentGlob))
}

instrumentAll().catch(error => {
  console.log(error)
  process.exit(1)
})
