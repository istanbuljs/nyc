'use strict'

/* global __coverage__ */

const cachingTransform = require('caching-transform')
const cpFile = require('cp-file')
const findCacheDir = require('find-cache-dir')
const fs = require('fs')
const glob = require('glob')
const Hash = require('./lib/hash')
const libCoverage = require('istanbul-lib-coverage')
const libHook = require('istanbul-lib-hook')
const libReport = require('istanbul-lib-report')
const mkdirp = require('make-dir')
const Module = require('module')
const onExit = require('signal-exit')
const path = require('path')
const reports = require('istanbul-reports')
const resolveFrom = require('resolve-from')
const rimraf = require('rimraf')
const SourceMaps = require('./lib/source-maps')
const testExclude = require('test-exclude')
const util = require('util')
const uuid = require('uuid/v4')

const debugLog = util.debuglog('nyc')

const ProcessInfo = require('./lib/process.js')

/* istanbul ignore next */
if (/self-coverage/.test(__dirname)) {
  require('../self-coverage-helper')
}

function NYC (config) {
  config = config || {}
  this.config = config

  this.subprocessBin = config.subprocessBin || path.resolve(__dirname, './bin/nyc.js')
  this._tempDirectory = config.tempDirectory || config.tempDir || './.nyc_output'
  this._instrumenterLib = require(config.instrumenter || './lib/instrumenters/istanbul')
  this._reportDir = config.reportDir || 'coverage'
  this._sourceMap = typeof config.sourceMap === 'boolean' ? config.sourceMap : true
  this._showProcessTree = config.showProcessTree || false
  this._eagerInstantiation = config.eager || false
  this.cwd = config.cwd || process.cwd()
  this.reporter = [].concat(config.reporter || 'text')

  this.cacheDirectory = (config.cacheDir && path.resolve(config.cacheDir)) || findCacheDir({ name: 'nyc', cwd: this.cwd })
  this.cache = Boolean(this.cacheDirectory && config.cache)

  this.extensions = [].concat(config.extension || [])
    .concat('.js')
    .map(ext => ext.toLowerCase())
    .filter((item, pos, arr) => arr.indexOf(item) === pos)

  this.exclude = testExclude({
    cwd: this.cwd,
    include: config.include,
    exclude: config.exclude,
    excludeNodeModules: config.excludeNodeModules !== false,
    extension: this.extensions
  })

  this.sourceMaps = new SourceMaps({
    cache: this.cache,
    cacheDirectory: this.cacheDirectory
  })

  // require extensions can be provided as config in package.json.
  this.require = [].concat(config.require || [])

  this.transforms = this.extensions.reduce((transforms, ext) => {
    transforms[ext] = this._createTransform(ext)
    return transforms
  }, {})

  this.hookRequire = config.hookRequire
  this.hookRunInContext = config.hookRunInContext
  this.hookRunInThisContext = config.hookRunInThisContext
  this.fakeRequire = null

  this.processInfo = new ProcessInfo(config && config._processInfo)
  this.rootId = this.processInfo.root || this.generateUniqueID()

  this.hashCache = {}
}

NYC.prototype._createTransform = function (ext) {
  var opts = {
    salt: Hash.salt(this.config),
    hashData: (input, metadata) => [metadata.filename],
    onHash: (input, metadata, hash) => {
      this.hashCache[metadata.filename] = hash
    },
    cacheDir: this.cacheDirectory,
    // when running --all we should not load source-file from
    // cache, we want to instead return the fake source.
    disableCache: this._disableCachingTransform(),
    ext: ext
  }
  if (this._eagerInstantiation) {
    opts.transform = this._transformFactory(this.cacheDirectory)
  } else {
    opts.factory = this._transformFactory.bind(this)
  }
  return cachingTransform(opts)
}

NYC.prototype._disableCachingTransform = function () {
  return !(this.cache && this.config.isChildProcess)
}

NYC.prototype._loadAdditionalModules = function () {
  this.require.forEach(requireModule => {
    // Attempt to require the module relative to the directory being instrumented.
    // Then try other locations, e.g. the nyc node_modules folder.
    require(resolveFrom.silent(this.cwd, requireModule) || requireModule)
  })
}

NYC.prototype.instrumenter = function () {
  return this._instrumenter || (this._instrumenter = this._createInstrumenter())
}

NYC.prototype._createInstrumenter = function () {
  return this._instrumenterLib({
    ignoreClassMethods: [].concat(this.config.ignoreClassMethod).filter(a => a),
    produceSourceMap: this.config.produceSourceMap,
    compact: this.config.compact,
    preserveComments: this.config.preserveComments,
    esModules: this.config.esModules,
    plugins: this.config.parserPlugins
  })
}

NYC.prototype.addFile = function (filename) {
  const source = this._readTranspiledSource(filename)
  this._maybeInstrumentSource(source, filename)
}

NYC.prototype._readTranspiledSource = function (filePath) {
  var source = null
  var ext = path.extname(filePath)
  if (typeof Module._extensions[ext] === 'undefined') {
    ext = '.js'
  }
  Module._extensions[ext]({
    _compile: function (content, filename) {
      source = content
    }
  }, filePath)
  return source
}

NYC.prototype.addAllFiles = function () {
  this._loadAdditionalModules()

  this.fakeRequire = true
  this.exclude.globSync(this.cwd).forEach(relFile => {
    const filename = path.resolve(this.cwd, relFile)
    this.addFile(filename)
    const coverage = coverageFinder()
    const lastCoverage = this.instrumenter().lastFileCoverage()
    if (lastCoverage) {
      coverage[lastCoverage.path] = lastCoverage
    }
  })
  this.fakeRequire = false

  this.writeCoverageFile()
}

NYC.prototype.instrumentAllFiles = function (input, output, cb) {
  let inputDir = '.' + path.sep
  const visitor = relFile => {
    const inFile = path.resolve(inputDir, relFile)
    const inCode = fs.readFileSync(inFile, 'utf-8')
    const outCode = this._transform(inCode, inFile) || inCode

    if (output) {
      const mode = fs.statSync(inFile).mode
      const outFile = path.resolve(output, relFile)
      mkdirp.sync(path.dirname(outFile))
      fs.writeFileSync(outFile, outCode)
      fs.chmodSync(outFile, mode)
    } else {
      console.log(outCode)
    }
  }

  this._loadAdditionalModules()

  try {
    const stats = fs.lstatSync(input)
    if (stats.isDirectory()) {
      inputDir = input

      const filesToInstrument = this.exclude.globSync(input)

      if (this.config.completeCopy && output) {
        const globOptions = { dot: true, nodir: true, ignore: ['**/.git', '**/.git/**', path.join(output, '**')] }
        glob.sync(path.resolve(input, '**'), globOptions)
          .forEach(src => cpFile.sync(src, path.join(output, path.relative(input, src))))
      }
      filesToInstrument.forEach(visitor)
    } else {
      visitor(input)
    }
  } catch (err) {
    return cb(err)
  }
  cb()
}

NYC.prototype._transform = function (code, filename) {
  const extname = path.extname(filename).toLowerCase()
  const transform = this.transforms[extname] || (() => null)

  return transform(code, { filename })
}

NYC.prototype._maybeInstrumentSource = function (code, filename) {
  if (!this.exclude.shouldInstrument(filename)) {
    return null
  }

  return this._transform(code, filename)
}

NYC.prototype._transformFactory = function (cacheDir) {
  const instrumenter = this.instrumenter()
  let instrumented

  return (code, metadata, hash) => {
    const filename = metadata.filename
    let sourceMap = null

    if (this._sourceMap) sourceMap = this.sourceMaps.extractAndRegister(code, filename, hash)

    try {
      instrumented = instrumenter.instrumentSync(code, filename, sourceMap)
    } catch (e) {
      debugLog('failed to instrument ' + filename + ' with error: ' + e.stack)
      if (this.config.exitOnError) {
        console.error('Failed to instrument ' + filename)
        process.exit(1)
      } else {
        instrumented = code
      }
    }

    if (this.fakeRequire) {
      return 'function x () {}'
    } else {
      return instrumented
    }
  }
}

NYC.prototype._handleJs = function (code, options) {
  // ensure the path has correct casing (see istanbuljs/nyc#269 and nodejs/node#6624)
  const filename = path.resolve(this.cwd, options.filename)
  return this._maybeInstrumentSource(code, filename) || code
}

NYC.prototype._addHook = function (type) {
  const handleJs = this._handleJs.bind(this)
  const dummyMatcher = () => true // we do all processing in transformer
  libHook['hook' + type](dummyMatcher, handleJs, { extensions: this.extensions })
}

NYC.prototype._addRequireHooks = function () {
  if (this.hookRequire) {
    this._addHook('Require')
  }
  if (this.hookRunInContext) {
    this._addHook('RunInContext')
  }
  if (this.hookRunInThisContext) {
    this._addHook('RunInThisContext')
  }
}

NYC.prototype.cleanup = function () {
  if (!process.env.NYC_CWD) rimraf.sync(this.tempDirectory())
}

NYC.prototype.clearCache = function () {
  if (this.cache) {
    rimraf.sync(this.cacheDirectory)
  }
}

NYC.prototype.createTempDirectory = function () {
  mkdirp.sync(this.tempDirectory())
  if (this.cache) mkdirp.sync(this.cacheDirectory)

  mkdirp.sync(this.processInfoDirectory())
}

NYC.prototype.reset = function () {
  this.cleanup()
  this.createTempDirectory()
}

NYC.prototype._wrapExit = function () {
  // we always want to write coverage
  // regardless of how the process exits.
  onExit(() => {
    this.writeCoverageFile()
  }, { alwaysLast: true })
}

NYC.prototype.wrap = function (bin) {
  process.env.NYC_PROCESS_ID = this.processInfo.uuid
  this._addRequireHooks()
  this._wrapExit()
  this._loadAdditionalModules()
  return this
}

NYC.prototype.generateUniqueID = uuid

NYC.prototype.writeCoverageFile = function () {
  var coverage = coverageFinder()
  if (!coverage) return

  // Remove any files that should be excluded but snuck into the coverage
  Object.keys(coverage).forEach(function (absFile) {
    if (!this.exclude.shouldInstrument(absFile)) {
      delete coverage[absFile]
    }
  }, this)

  if (this.cache) {
    Object.keys(coverage).forEach(function (absFile) {
      if (this.hashCache[absFile] && coverage[absFile]) {
        coverage[absFile].contentHash = this.hashCache[absFile]
      }
    }, this)
  } else {
    coverage = this.sourceMaps.remapCoverage(coverage)
  }

  var id = this.processInfo.uuid
  var coverageFilename = path.resolve(this.tempDirectory(), id + '.json')

  fs.writeFileSync(
    coverageFilename,
    JSON.stringify(coverage),
    'utf-8'
  )

  this.processInfo.coverageFilename = coverageFilename
  this.processInfo.files = Object.keys(coverage)

  fs.writeFileSync(
    path.resolve(this.processInfoDirectory(), id + '.json'),
    JSON.stringify(this.processInfo),
    'utf-8'
  )
}

function coverageFinder () {
  var coverage = global.__coverage__
  if (typeof __coverage__ === 'object') coverage = __coverage__
  if (!coverage) coverage = global['__coverage__'] = {}
  return coverage
}

NYC.prototype.getCoverageMapFromAllCoverageFiles = function (baseDirectory) {
  const map = libCoverage.createCoverageMap({})

  this.eachReport(undefined, (report) => {
    map.merge(report)
  }, baseDirectory)

  map.data = this.sourceMaps.remapCoverage(map.data)

  // depending on whether source-code is pre-instrumented
  // or instrumented using a JIT plugin like @babel/require
  // you may opt to exclude files after applying
  // source-map remapping logic.
  if (this.config.excludeAfterRemap) {
    map.filter(filename => this.exclude.shouldInstrument(filename))
  }

  return map
}

NYC.prototype.report = function () {
  var tree
  var map = this.getCoverageMapFromAllCoverageFiles()
  var context = libReport.createContext({
    dir: this.reportDirectory(),
    watermarks: this.config.watermarks
  })

  tree = libReport.summarizers.pkg(map)

  this.reporter.forEach((_reporter) => {
    tree.visit(reports.create(_reporter, {
      skipEmpty: this.config.skipEmpty,
      skipFull: this.config.skipFull
    }), context)
  })

  if (this._showProcessTree) {
    this.showProcessTree()
  }
}

// XXX(@isaacs) Index generation should move to istanbul-lib-processinfo
NYC.prototype.writeProcessIndex = function () {
  const dir = this.processInfoDirectory()
  const pidToUid = new Map()
  const infoByUid = new Map()
  const eidToUid = new Map()
  const infos = fs.readdirSync(dir).filter(f => f !== 'index.json').map(f => {
    try {
      const info = JSON.parse(fs.readFileSync(path.resolve(dir, f), 'utf-8'))
      info.children = []
      pidToUid.set(info.uuid, info.pid)
      pidToUid.set(info.pid, info.uuid)
      infoByUid.set(info.uuid, info)
      if (info.externalId) {
        eidToUid.set(info.externalId, info.uuid)
      }
      return info
    } catch (er) {
      return null
    }
  }).filter(Boolean)

  // create all the parent-child links and write back the updated info
  infos.forEach(info => {
    if (info.parent) {
      const parentInfo = infoByUid.get(info.parent)
      if (parentInfo.children.indexOf(info.uuid) === -1) {
        parentInfo.children.push(info.uuid)
      }
    }
  })

  // figure out which files were touched by each process.
  const files = infos.reduce((files, info) => {
    info.files.forEach(f => {
      files[f] = files[f] || []
      files[f].push(info.uuid)
    })
    return files
  }, {})

  // build the actual index!
  const index = infos.reduce((index, info) => {
    index.processes[info.uuid] = {}
    index.processes[info.uuid].parent = info.parent
    if (info.externalId) {
      if (index.externalIds[info.externalId]) {
        throw new Error(`External ID ${info.externalId} used by multiple processes`)
      }
      index.processes[info.uuid].externalId = info.externalId
      index.externalIds[info.externalId] = {
        root: info.uuid,
        children: info.children
      }
    }
    index.processes[info.uuid].children = Array.from(info.children)
    return index
  }, { processes: {}, files: files, externalIds: {} })

  // flatten the descendant sets of all the externalId procs
  Object.keys(index.externalIds).forEach(eid => {
    const { children } = index.externalIds[eid]
    // push the next generation onto the list so we accumulate them all
    for (let i = 0; i < children.length; i++) {
      const nextGen = index.processes[children[i]].children
      if (nextGen && nextGen.length) {
        children.push(...nextGen.filter(uuid => children.indexOf(uuid) === -1))
      }
    }
  })

  fs.writeFileSync(path.resolve(dir, 'index.json'), JSON.stringify(index))
}

NYC.prototype.showProcessTree = function () {
  var processTree = ProcessInfo.buildProcessTree(this._loadProcessInfos())

  console.log(processTree.render(this))
}

NYC.prototype.checkCoverage = function (thresholds, perFile) {
  var map = this.getCoverageMapFromAllCoverageFiles()
  var nyc = this

  if (perFile) {
    map.files().forEach(function (file) {
      // ERROR: Coverage for lines (90.12%) does not meet threshold (120%) for index.js
      nyc._checkCoverage(map.fileCoverageFor(file).toSummary(), thresholds, file)
    })
  } else {
    // ERROR: Coverage for lines (90.12%) does not meet global threshold (120%)
    nyc._checkCoverage(map.getCoverageSummary(), thresholds)
  }
}

NYC.prototype._checkCoverage = function (summary, thresholds, file) {
  Object.keys(thresholds).forEach(function (key) {
    var coverage = summary[key].pct
    if (coverage < thresholds[key]) {
      process.exitCode = 1
      if (file) {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet threshold (' + thresholds[key] + '%) for ' + file)
      } else {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet global threshold (' + thresholds[key] + '%)')
      }
    }
  })
}

NYC.prototype._loadProcessInfos = function () {
  return fs.readdirSync(this.processInfoDirectory()).map(f => {
    let data
    try {
      data = JSON.parse(fs.readFileSync(
        path.resolve(this.processInfoDirectory(), f),
        'utf-8'
      ))
    } catch (e) { // handle corrupt JSON output.
      return null
    }
    if (f !== 'index.json') {
      data.nodes = []
      data = new ProcessInfo(data)
    }
    return { file: path.basename(f, '.json'), data: data }
  }).filter(Boolean).reduce((infos, info) => {
    infos[info.file] = info.data
    return infos
  }, {})
}

NYC.prototype.eachReport = function (filenames, iterator, baseDirectory) {
  baseDirectory = baseDirectory || this.tempDirectory()

  if (typeof filenames === 'function') {
    iterator = filenames
    filenames = undefined
  }

  var _this = this
  var files = filenames || fs.readdirSync(baseDirectory)

  files.forEach(function (f) {
    var report
    try {
      report = JSON.parse(fs.readFileSync(
        path.resolve(baseDirectory, f),
        'utf-8'
      ))

      _this.sourceMaps.reloadCachedSourceMaps(report)
    } catch (e) { // handle corrupt JSON output.
      report = {}
    }

    iterator(report)
  })
}

NYC.prototype.loadReports = function (filenames) {
  var reports = []

  this.eachReport(filenames, (report) => {
    reports.push(report)
  })

  return reports
}

NYC.prototype.tempDirectory = function () {
  return path.resolve(this.cwd, this._tempDirectory)
}

NYC.prototype.reportDirectory = function () {
  return path.resolve(this.cwd, this._reportDir)
}

NYC.prototype.processInfoDirectory = function () {
  return path.resolve(this.tempDirectory(), 'processinfo')
}

module.exports = NYC
