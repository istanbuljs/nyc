'use strict'

const { createInstrumenter } = require('istanbul-lib-instrument')
const convertSourceMap = require('convert-source-map')
const mergeSourceMap = require('merge-source-map')

function InstrumenterIstanbul (options) {
  const { plugins } = options
  const configPlugins = plugins ? { plugins } : {}

  const instrumenter = createInstrumenter(Object.assign({
    autoWrap: true,
    coverageVariable: '__coverage__',
    embedSource: true,
    compact: options.compact,
    preserveComments: options.preserveComments,
    produceSourceMap: options.produceSourceMap,
    ignoreClassMethods: options.ignoreClassMethods,
    esModules: options.esModules
  }, configPlugins))

  return {
    instrumentSync (code, filename, sourceMap) {
      var instrumented = instrumenter.instrumentSync(code, filename)
      // the instrumenter can optionally produce source maps,
      // this is useful for features like remapping stack-traces.
      // TODO: test source-map merging logic.
      if (options.produceSourceMap) {
        var lastSourceMap = instrumenter.lastSourceMap()
        if (lastSourceMap) {
          if (sourceMap) {
            lastSourceMap = mergeSourceMap(
              sourceMap.toObject(),
              lastSourceMap
            )
          }
          instrumented += '\n' + convertSourceMap.fromObject(lastSourceMap).toComment()
        }
      }
      return instrumented
    },
    lastFileCoverage () {
      return instrumenter.lastFileCoverage()
    }
  }
}

module.exports = InstrumenterIstanbul
