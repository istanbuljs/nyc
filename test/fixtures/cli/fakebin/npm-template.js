// shebang gets added before this line
var which = require('which')
var assert = require('assert')
var { foregroundChild } = require('foreground-child')

// strip first PATH folder
process.env.PATH = process.env.PATH.replace(/^.+?[:;]/, '')

foregroundChild('npm', process.argv.slice(2))
