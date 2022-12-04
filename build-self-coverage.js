'use strict'

const path = require('path')
const fs = require('fs')
const istanbul = require('istanbul-lib-instrument')
const makeDir = require('make-dir')
const glob = require('glob')

const instrumenter = istanbul.createInstrumenter({
  coverageVariable: '___NYC_SELF_COVERAGE___',
  esModules: true
})

function instrumentFile (name) {
  const indexPath = path.join(__dirname, name)
  const outputPath = path.join(__dirname, 'self-coverage', name)

  const source = fs.readFileSync(indexPath, 'utf8')
  const instrumentedSource = name === 'package.json' ? source : instrumenter.instrumentSync(source, indexPath)

  makeDir.sync(path.dirname(outputPath))
  fs.writeFileSync(outputPath, instrumentedSource)
}

function instrumentGlob (pattern) {
  const result = glob.sync(pattern, {
    cwd: __dirname,
    nodir: true
  })

  result.forEach(file => {
    instrumentFile(file)
  })
}

function instrumentAll () {
  /* package.json is just being copied so the instrumented copy of lib/hash.js can find it. */
  const globPatterns = ['package.json', 'index.js', 'bin/*.js', 'lib/**/*.js']

  globPatterns.forEach(pattern => {
    instrumentGlob(pattern)
  })
}

instrumentAll()
