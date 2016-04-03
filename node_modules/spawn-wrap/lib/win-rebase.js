var re = /^\s*("*)([^"]*?\b(?:node|iojs)(?:\.exe)?)("*)( |$)/

module.exports = function (path, rebase) {
  var m = path.match(re)
  if (!m) return path
  // preserve the quotes
  var replace = m[1] + rebase + m[3] + m[4]
  return path.replace(re, replace)
}
