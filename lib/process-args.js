'use strict';

const {Parser: yargsParser} = require('yargs/yargs');
const commands = [
  'report',
  'check-coverage',
  'instrument',
  'merge'
];

module.exports = {
  // Don't pass arguments that are meant for nyc to the bin being instrumented.
  hideInstrumenterArgs(yargv) {
    let argv = process.argv.slice(1);
    argv = argv.slice(argv.indexOf(yargv._[0]));
    if (argv[0][0] === '-') {
      argv.unshift(process.execPath);
    }

    return argv;
  },
  // Don't pass arguments for the bin being instrumented to nyc.
  hideInstrumenteeArgs() {
    let argv = process.argv.slice(2);
    const yargv = yargsParser(argv);
    if (yargv._.length === 0) {
      return argv;
    }

    for (let i = 0, command; (command = yargv._[i]) !== undefined; i++) {
      if (commands.includes(command)) {
        return argv;
      }
    }

    // Drop all the arguments after the bin being instrumented by nyc.
    argv = argv.slice(0, argv.indexOf(yargv._[0]));
    argv.push(yargv._[0]);

    return argv;
  }
};
