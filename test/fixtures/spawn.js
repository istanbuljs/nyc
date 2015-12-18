#!/usr/bin/env node

var spawn = require('child_process').spawn
spawn(process.execPath, ['sigint.js'], { cwd: __dirname })
spawn(process.execPath, ['sigterm.js'], { cwd: __dirname })
