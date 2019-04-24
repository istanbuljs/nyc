const config = JSON.parse(process.env.NYC_CONFIG)
const { include } = config

if (process.argv[2] !== 'child') {
  console.log('in parent', { include })
  require('child_process').spawn(process.execPath, [__filename, 'child'], {
    cwd: __dirname,
    env: Object.assign(
      {},
      process.env,
      {
        NYC_CONFIG_OVERRIDE: JSON.stringify({
          include: 'conf-override-module.js'
        })
      }
    ),
    stdio: 'inherit',
  })
} else {
  // this should run, but not be covered, even though the shebang says to
  // the child run ONLY covers the child file, not the dump-root.js
  console.log('in child', { include })
  require('./conf-override-module.js')
}
