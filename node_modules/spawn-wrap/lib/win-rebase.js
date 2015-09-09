var re = new RegExp(/(.*((node\.exe($| ))|(node($| ))|(iojs($| ))|(iojs\.exe($| )))) ?(.*)$/)

module.exports = function (path, rebase) {
  var m = path.match(re)
  if (!m) return path
  return path.replace(m[1].trim(), rebase)
}
