var istanbul = require('istanbul-lib-instrument')
var fs = require('fs')
var path = require('path')

;[
  'index.js',
  'lib/process.js'
].forEach(function (name) {
  var indexPath = path.join(__dirname, name)
  var source = fs.readFileSync(indexPath, 'utf8')

  var instrumentor = istanbul.createInstrumenter({
    coverageVariable: '___NYC_SELF_COVERAGE___',
    esModules: true
  })

  var instrumentedSource = instrumentor.instrumentSync(source, indexPath)

  var outputPath = path.join(__dirname, name.replace(/\.js$/, '.covered.js'))
  fs.writeFileSync(outputPath, instrumentedSource)
})
