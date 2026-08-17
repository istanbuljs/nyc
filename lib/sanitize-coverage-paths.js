'use strict'

const libCoverage = require('istanbul-lib-coverage')

// Characters that cannot appear in a Windows path segment. Colon is included
// because sourcemap sources such as `angular:script` are not drive letters.
const INVALID_SEGMENT_CHARS = /[<>:"|?*]/g

function sanitizePathSegments (filePath) {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return filePath
  }

  const driveMatch = filePath.match(/^([A-Za-z]:)([\\/])/)
  let prefix = ''
  let rest = filePath
  if (driveMatch) {
    prefix = driveMatch[1] + driveMatch[2]
    rest = filePath.slice(prefix.length)
  } else if (filePath.charAt(0) === '/' || filePath.charAt(0) === '\\') {
    prefix = filePath.charAt(0)
    rest = filePath.slice(1)
  }

  const separator = driveMatch && filePath.indexOf('\\') !== -1 ? '\\' : '/'
  return prefix + rest.split(/[/\\]/).map(segment => (
    segment.replace(INVALID_SEGMENT_CHARS, '_')
  )).join(separator)
}

function coverageRecordWithPath (coverage, filePath) {
  if (!coverage || typeof coverage !== 'object') {
    return coverage
  }

  if (typeof coverage.toJSON === 'function') {
    const json = coverage.toJSON()
    json.path = filePath
    return libCoverage.createFileCoverage(json)
  }

  const copy = Object.assign({}, coverage)
  copy.path = filePath
  return copy
}

function sanitizeCoveragePaths (data) {
  const result = {}
  if (!data || typeof data !== 'object') {
    return result
  }

  Object.keys(data).forEach(filePath => {
    const safePath = sanitizePathSegments(filePath)
    result[safePath] = coverageRecordWithPath(data[filePath], safePath)
  })

  return result
}

module.exports = {
  sanitizePathSegments,
  sanitizeCoveragePaths
}
