# nyc

[![Build Status](https://travis-ci.org/bcoe/nyc.png)](https://travis-ci.org/bcoe/nyc)
[![Coverage Status](https://coveralls.io/repos/bcoe/nyc/badge.svg?branch=)](https://coveralls.io/r/bcoe/nyc?branch=)
[![NPM version](https://img.shields.io/npm/v/nyc.svg)](https://www.npmjs.com/package/nyc)
[![Windows Tests](https://img.shields.io/appveyor/ci/bcoe/nyc/master.svg?label=Windows%20Tests)](https://ci.appveyor.com/project/bcoe/nyc)


```shell
nyc npm test
```

a code coverage tool built on [istanbul](https://www.npmjs.com/package/istanbul)
that works for applications that spawn subprocesses.

## Instrumenting Your Code

Simply run your tests with `nyc`, and it will collect coverage information for
each process and store it in `.nyc_output`.

```shell
nyc npm test
```

you can pass a list of Istanbul reporters that you'd like to run:

```shell
nyc --reporter=lcov --reporter=text-lcov npm test
```

If you're so inclined, you can simply add nyc to the test stanza in your package.json:

```json
{
  "script": {
    "test": "nyc tap ./test/*.js"
  }
}
```

## Support For Custom Require Hooks (Babel! ES2015!)

nyc supports custom require hooks like
[`babel-register`](http://babeljs.io/docs/usage/require/). If necessary nyc can
load the hooks for you, [using the `--require`
flag](#require-additional-modules).

Source maps are used to map coverage information back to the appropriate lines
of the pre-transpiled code. You'll have to configure your custom require hook
to inline the source map in the transpiled code. For Babel that means setting
the `sourceMaps` option to `inline`.

## Checking Coverage

nyc exposes istanbul's check-coverage tool. After running your tests with nyc,
simply run:

```shell
nyc check-coverage --lines 95 --functions 95 --branches 95
```

This feature makes it easy to fail your tests if coverage drops below a given threshold.

## Running Reports

Once you've run your tests with nyc, simply run:

```bash
nyc report
```

To view your coverage report:

<img width="500" src="screen.png">

you can use any reporters that are supported by istanbul:

```bash
nyc report --reporter=lcov
```

## Excluding Files

You can tell nyc to exclude specific files and directories by adding
an `nyc.exclude` array to your `package.json`. Each element of
the array is a glob pattern indicating which paths should be omitted.

Globs are matched using [micromatch](https://www.npmjs.com/package/micromatch)

In addition to patterns specified in the package, nyc will always exclude
files in `node_modules`.

For example, the following config will exclude everything in `node_modules`,
any files with the extension `.spec.js`, and anything in the `build`
directory:

```json
{"nyc": {
  "exclude": [
      "**/*.spec.js",
      "build"
    ]
  }
}
```

> Note: exclude defaults to `['test', 'test{,-*}.js']`, which would exclude
the `test` directory as well as `test.js` and `test-*.js` files

## Including Files

As an alternative to providing a list of files to `exclude`, you can provide
an `include` key to specify specific files that should be covered:

```json
{"config": {
  "nyc": {
    "include": ["**/build/umd/moment.js"]
  }
}}
```

> Note: include defaults to `['**']`

## Include Reports For Files That Are Not Required

By default nyc does not collect coverage for files that have not
been required, run nyc with the flag `--all` to enable this.

## Require additional modules

The `--require` flag can be provided to `nyc` to indicate that additional
modules should be required in the subprocess collecting coverage:

`nyc --require babel-core/register --require babel-polyfill mocha`

## Configuring Istanbul

Behind the scenes nyc uses [istanbul](https://www.npmjs.com/package/istanbul). You
can place a `.istanbul.yml` file in your project's root directory to pass config
setings to istanbul's code instrumenter:

```yml
instrumentation:
  preserve-comments: true
```

## Integrating With Coveralls

[coveralls.io](https://coveralls.io) is a great tool for adding
coverage reports to your GitHub project. Here's how to get nyc
integrated with coveralls and travis-ci.org:

1. add the coveralls and nyc dependencies to your module:

```shell
npm install coveralls nyc --save
```

2. update the scripts in your package.json to include these bins:

```bash
{
  "script": {
    "test": "nyc tap ./test/*.js",
    "coverage": "nyc npm test && nyc report --reporter=text-lcov | coveralls",
  }
}
```

3. For private repos, add the environment variable `COVERALLS_REPO_TOKEN` to travis.

4. add the following to your `.travis.yml`:

```yaml
after_success: npm run coverage
```

That's all there is to it!

> Note: by default coveralls.io adds comments to pull-requests on GitHub, this can feel intrusive. To disable this, click on your repo on coveralls.io and uncheck `LEAVE COMMENTS?`.
