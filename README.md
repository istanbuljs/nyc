# nyc

[![Build Status](https://travis-ci.org/istanbuljs/nyc.svg?branch=master)](https://travis-ci.org/istanbuljs/nyc)
[![Coverage Status](https://coveralls.io/repos/bcoe/nyc/badge.svg?branch=)](https://coveralls.io/r/bcoe/nyc?branch=master)
[![NPM version](https://img.shields.io/npm/v/nyc.svg)](https://www.npmjs.com/package/nyc)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![community slack](http://devtoolscommunity.herokuapp.com/badge.svg)](http://devtoolscommunity.herokuapp.com)

_Having problems? want to contribute? join our [community slack](http://devtoolscommunity.herokuapp.com)_.

Istanbul's state of the art command line interface, with support for:

* applications that spawn subprocesses.
* ES2015 transforms, via [`babel-plugin-istanbul`], or source-maps.

## Instrumenting your code

You can install nyc as a development dependency and add it to the test stanza
in your package.json.

```shell
npm i nyc --save-dev
```

```json
{
  "scripts": {
    "test": "nyc mocha"
  }
}
```

Alternatively, you can install nyc globally and use it to execute `npm test`:

```shell
npm i nyc -g
```

```shell
nyc npm test
```

nyc accepts a wide variety of configuration arguments, run `nyc --help` for
thorough documentation.

Configuration arguments should be provided prior to the program that nyc
is executing. As an example, the following command executes `npm test`,
and indicates to nyc that it should output both an `lcov`
and a `text-lcov` coverage report.

```shell
nyc --reporter=lcov --reporter=text-lcov npm test
```

### Accurate stack traces using source-maps

When `produce-source-map` is set to true, then the instrumented source files will
include inline source maps for the instrumenter transform. When combined with
[source-map-support](https://github.com/evanw/node-source-map-support),
stack traces for instrumented code will reflect their original lines.

### Support for custom require hooks (babel, typescript, etc.)

nyc supports custom require hooks like [`@babel/register`]. nyc can load
the hooks for you, [using the `--require` flag](#require-additional-modules).

Source maps are used to map coverage information back to the appropriate lines
of the pre-transpiled code. You'll have to configure your custom require hook
to inline the source-map in the transpiled code. For Babel that means setting
the `sourceMaps` option to `inline`.

### Source-Map support for pre-instrumented codebases

If you opt to pre-instrument your source-code (rather than using a just-in-time
transpiler like [`@babel/register`]) nyc supports both inline source-maps and
`.map` files.

_Important: If you are using nyc with a project that pre-instruments its code,
run nyc with the configuration option `--exclude-after-remap` set to `false`.
Otherwise nyc's reports will exclude any files that source-maps remap to folders
covered under exclude rules._

## Use with `babel-plugin-istanbul` for Babel Support

We recommend using [`babel-plugin-istanbul`] if your project uses the babel tool chain:

1. enable the `babel-plugin-istanbul` plugin:

  ```json
    {
      "babel": {
        "presets": ["@babel/preset-env"],
        "env": {
          "test": {
            "plugins": ["istanbul"]
          }
        }
      }
    }
  ```

  Note: With this configuration, the Istanbul instrumentation will only be active when `NODE_ENV` or `BABEL_ENV` is `test` unless the environment is a valid entry in `"env"` within the `.babelrc` file.

  We recommend using the [`cross-env`](https://npmjs.com/package/cross-env) package to set these environment variables
  in your `package.json` scripts in a way that works cross-platform.

2. disable nyc's instrumentation and source-maps, e.g. in `package.json`:

  ```json
  {
    "nyc": {
      "require": [
        "@babel/register"
      ],
      "sourceMap": false,
      "instrument": false
    },
    "scripts": {
      "test": "cross-env NODE_ENV=test nyc mocha"
    }
  }
  ```

That's all there is to it, better ES2015+ syntax highlighting awaits:

<img width="500" src="screen2.png">

## Support for alternate file extensions (.jsx, .mjs)

Supporting file extensions can be configured through either the configuration arguments or with the `nyc` config section in `package.json`.

```shell
nyc --extension .jsx --extension .mjs npm test
```

```json
{
  "nyc": {
    "extension": [
      ".jsx",
      ".mjs"
    ]
  }
}
```

## Checking coverage

nyc can fail tests if coverage falls below a threshold.
After running your tests with nyc, simply run:

```shell
nyc check-coverage --lines 95 --functions 95 --branches 95
```

nyc also accepts a `--check-coverage` shorthand, which can be used to
both run tests and check that coverage falls within the threshold provided:

```shell
nyc --check-coverage --lines 100 npm test
```

The above check fails if coverage falls below 100%.

To check thresholds on a per-file basis run:

```shell
nyc check-coverage --lines 95 --per-file
```

## Running reports

Once you've run your tests with nyc, simply run:

```bash
nyc report
```

To view your coverage report:

<img width="500" src="screen.png">

You can use [any reporters that are supported by `istanbul`](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib): `clover`, `cobertura`, `html`, `json-summary`, `json`, `lcov`, `lcovonly`, `none`, `teamcity`, `text-lcov`, `text-summary`, `text`.

```bash
nyc report --reporter=lcov
```

You can find examples of the output for various reporters [here](https://istanbul.js.org/docs/advanced/alternative-reporters).

You also have the choice of using a [custom reporter](https://github.com/pedrocarrico/istanbul-reporter-aws-cloudwatch-metrics).
Install custom reporters as a development dependency and you can use the `--reporter` flag to load and view them:

```bash
nyc report --reporter=<custom-reporter-name>
```

## Producing instrumented source

The `nyc instrument` command can produce a set of instrumented source files.
These files are suitable for client side deployment in end to end testing.
You can create an instrumented version of your source code by running:

```bash
nyc instrument <input> [output]
```

`<input>` can be any file or directory within the project root directory.
The `[output]` directory is optional and can be located anywhere, if it is not set the instrumented code will be sent to `stdout`.
For example, `nyc instrument . ./output` will produce instrumented versions of any source files it finds in `.` and store them in `./output`.

Any existing output can be removed by specifying the `--delete` option.
Run `nyc instrument --help` to display a full list of available command options.

**Note:** `nyc instrument` will not copy the contents of a `.git` folder to the output directory.

## Setting the project root directory

nyc runs a lot of file system operations relative to the project root directory.
During startup nyc will look for the *default* project root directory.
The *default* project root directory is the first directory found that contains a `package.json` file when searching from the current working directory up.
If nyc fails to find a directory containing a `package.json` file, it will use the current working directory as the *default* project root directory.
You can change the project root directory with the `--cwd` option.

nyc uses the project root directory when:
 * looking for source files to instrument
 * creating globs for include and exclude rules during file selection
 * loading custom require hooks from the `require` array

nyc may create artefact directories within the project root, such as:
  * the report directory, `<project-root>/coverage`
  * the cache directory, `<project-root>/node_modules/.cache/nyc`
  * the temp directory, `<project-root>/.nyc_output`

## Selecting files for coverage

By default, nyc only collects coverage for source files that are visited during a test.
It does this by watching for files that are `require()`'d during the test.
When a file is `require()`'d, nyc creates and returns an instrumented version of the source, rather than the original. 
Only source files that are visited during a test will appear in the coverage report and contribute to coverage statistics.

nyc will instrument all files if the `--all` flag is set or if running `nyc instrument`.
In this case all files will appear in the coverage report and contribute to coverage statistics.

nyc will only collect coverage for files that are located under `cwd`, and then only `*.js` files or files with extensions listed in the `extension` array.

You can reduce the set of instrumented files by adding `include` and `exclude` filter arrays to your config.
These allow you to shape the set of instrumented files by specifying glob patterns that can filter files from the default instrumented set.
The `exclude` array may also use exclude negated glob patterns, these are specified with a `!` prefix, and can restore sub-paths of excluded paths.

Globs are matched using [minimatch](https://www.npmjs.com/package/minimatch).

We use the following process to remove files from consideration:
 1. Limit the set of instrumented files to those files in paths listed in the `include` array.
 2. Remove any files that are found in the `exclude` array.
 3. Restore any exclude negated files that have been excluded in step 2.

### Using include and exclude arrays

If there are paths specified in the `include` array, then the set of instrumented files will be limited to eligible files found in those paths.
If the `include` array is left undefined all eligible files will be included, equivalent to setting `include: ['**']`.
Multiple `include` globs can be specified on the command line, each must follow a `--include`, `-n` switch.

If there are paths specified in the `exclude` array, then the set of instrumented files will not feature eligible files found in those paths.
You can also specify negated paths in the `exclude` array, by prefixing them with a `!`.
Negated paths can restore paths that have been already been excluded in the `exclude` array.
Multiple `exclude` globs can be specified on the command line, each must follow a `--exclude`, `-x` switch.

The `exclude` option has the following defaults settings:
```js
[
  'coverage/**',
  'packages/*/test/**',
  'test/**',
  'test{,-*}.js',
  '**/*{.,-}test.js',
  '**/__tests__/**',
  '**/node_modules/**',
  '**/babel.config.js'
]
```
These settings exclude `test` and `__tests__` directories as well as `test.js`, `*.test.js`, and `test-*.js` files.
Specifying your own exclude property completely replaces these defaults.

For example, the following config will collect coverage for every file in the `src` directory regardless of whether it is `require()`'d in a test.
It will also exclude any files with the extension `.spec.js`.

```json
{
  "nyc": {
    "all": true,
    "include": [
      "src/**/*.js"
    ],
    "exclude": [
      "**/*.spec.js"
    ]
  }
}
```

**Note:** Be wary of automatic OS glob expansion when specifying include/exclude globs with the CLI.
To prevent this, wrap each glob in single quotes.

### Including files within `node_modules`

We always add `**/node_modules/**` to the exclude list, even if not specified in the config.
You can override this by setting `--exclude-node-modules=false`.

For example, in the following config, `"excludeNodeModules: false"` will prevent `node_modules` from being added to the exclude rules. 
The set of include rules then restrict nyc to only consider instrumenting files found under the `lib/` and `node_modules/@my-org/` directories.
The exclude rules then prevent nyc instrumenting anything in a `test` folder and the file `node_modules/@my-org/something/unwanted.js`.

```json
{
  "nyc": {
    "all": true,
    "include": [
      "lib/**",
      "node_modules/@my-org/**"
    ],
    "exclude": [
      "node_modules/@my-org/something/unwanted.js",
      "**/test/**"
    ],
    "excludeNodeModules": false
  }
}
```

## Require additional modules

The `--require` flag can be provided to `nyc` to indicate that additional
modules should be required in the subprocess collecting coverage:

`nyc --require @babel/register --require @babel/polyfill mocha`

## Caching

`nyc`'s default behavior is to cache instrumented files to disk to prevent instrumenting source files multiple times, and speed `nyc` execution times. You can disable this behavior by running `nyc` with the `--cache false` flag. You can also change the default cache directory from `./node_modules/.cache/nyc` by setting the `--cache-dir` flag.

## Configuring `nyc`

Any configuration options that can be set via the command line can also be specified in the `nyc` stanza of your package.json, or within a `.nycrc`, `.nycrc.json`, or `nyc.config.js` file:

**package.json:**

```json
{
  "description": "These are just examples for demonstration, nothing prescriptive",
  "nyc": {
    "check-coverage": true,
    "per-file": true,
    "lines": 99,
    "statements": 99,
    "functions": 99,
    "branches": 99,
    "include": [
      "src/**/*.js"
    ],
    "exclude": [
      "src/**/*.spec.js"
    ],
    "ignore-class-method": "methodToIgnore",
    "reporter": [
      "lcov",
      "text-summary"
    ],
    "require": [
      "./test/helpers/some-helper.js"
    ],
    "extension": [
      ".jsx"
    ],
    "cache": true,
    "all": true,
    "temp-dir": "./alternative-tmp",
    "report-dir": "./alternative"
  }
}
```

Configuration can also be provided by `nyc.config.js` if programmed logic is required:
```js
'use strict';
const {defaultExclude} = require('test-exclude');
const isWindows = require('is-windows');

let platformExclude = [
  isWindows() ? 'lib/posix.js' : 'lib/win32.js'
];

module.exports = {
  exclude: platformExclude.concat(defaultExclude)
};
```

### Publish, and reuse, your nyc configuration

nyc allows you to inherit other configurations using the key `extends`. As an example,
an alternative way to configure nyc for `babel-plugin-istanbul` would be to use the
[@istanbuljs/nyc-config-babel preset](https://www.npmjs.com/package/@istanbuljs/nyc-config-babel):

```json
{
  "nyc": {
    "extends": "@istanbuljs/nyc-config-babel"
  }
}
```

To publish and resuse your own `nyc` configuration, simply create an npm module that
exports an `index.json` with your `nyc` config.

## High and low watermarks

Several of the coverage reporters supported by nyc display special information
for high and low watermarks:

* high-watermarks represent healthy test coverage (in many reports
  this is represented with green highlighting).
* low-watermarks represent sub-optimal coverage levels (in many reports
  this is represented with red highlighting).

You can specify custom high and low watermarks in nyc's configuration:

```json
{
  "nyc": {
    "watermarks": {
      "lines": [80, 95],
      "functions": [80, 95],
      "branches": [80, 95],
      "statements": [80, 95]
    }
  }
}
```

## Parsing Hints (Ignoring Lines)

There may be some sections of your codebase that you wish to purposefully
exclude from coverage tracking, to do so you can use the following parsing
hints:

* `/* istanbul ignore if */`: ignore the next if statement.
* `/* istanbul ignore else */`: ignore the else portion of an if statement.
* `/* istanbul ignore next */`: ignore the next _thing_ in the source-code (
 functions, if statements, classes, you name it).
* `/* istanbul ignore file */`: ignore an entire source-file (this should be
  placed at the top of the file).

## Ignoring Methods

There may be some methods that you want to universally ignore out of your classes
rather than having to ignore every instance of that method:

```json
{
  "nyc": {
    "ignore-class-method": "render"
  }
}
```

## [Integrating with coveralls](./docs/setup-coveralls.md)

## [Integrating with codecov](./docs/setup-codecov.md)

## Integrating with TAP formatters

Many testing frameworks (Mocha, Tape, Tap, etc.) can produce [TAP](https://en.wikipedia.org/wiki/Test_Anything_Protocol) output. [tap-nyc](https://github.com/MegaArman/tap-nyc) is a TAP formatter designed to look nice with nyc.

## More tutorials

You can find more tutorials at http://istanbul.js.org/docs/tutorials

## Other advanced features

Take a look at http://istanbul.js.org/docs/advanced/ and please feel free to [contribute documentation](https://github.com/istanbuljs/istanbuljs.github.io/tree/development/content).

[`@babel/register`]: https://www.npmjs.com/package/@babel/register
[`babel-plugin-istanbul`]: https://github.com/istanbuljs/babel-plugin-istanbul
