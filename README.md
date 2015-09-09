# nyc

[![Build Status](https://travis-ci.org/bcoe/nyc.png)](https://travis-ci.org/bcoe/nyc)
[![Coverage Status](https://coveralls.io/repos/bcoe/nyc/badge.svg?branch=)](https://coveralls.io/r/bcoe/nyc?branch=)
[![NPM version](https://img.shields.io/npm/v/nyc.svg)](https://www.npmjs.com/package/nyc)

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

```shell
--------------------|-----------|-----------|-----------|-----------|
File                |   % Stmts |% Branches |   % Funcs |   % Lines |
--------------------|-----------|-----------|-----------|-----------|
   ./               |     85.96 |        50 |        75 |     92.31 |
      index.js      |     85.96 |        50 |        75 |     92.31 |
   ./test/          |     98.08 |        50 |        95 |     98.04 |
      nyc-test.js   |     98.08 |        50 |        95 |     98.04 |
   ./test/fixtures/ |       100 |       100 |       100 |       100 |
      sigint.js     |       100 |       100 |       100 |       100 |
      sigterm.js    |       100 |       100 |       100 |       100 |
--------------------|-----------|-----------|-----------|-----------|
All files           |     91.89 |        50 |     86.11 |     95.24 |
--------------------|-----------|-----------|-----------|-----------|
```

you can use any reporters that are supported by istanbul:

```bash
nyc report --reporter=lcov
```

## Excluding Files

By default nyc does not instrument files in `node_modules`, or `test`
for coverage. You can override this setting in your package.json, by
adding the following configuration:

```js
{"config": {
  "nyc": {
    "exclude": [
      "node_modules/"
    ]
  }
}}
```

## Include Reports For Files That Are Not Required

By default nyc does not collect coverage for files that have not
been required, run nyc with the flag `--all` to enable this.

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
    "coverage": "nyc report --reporter=text-lcov | coveralls",
  }
}
```

3. add the environment variable `COVERALLS_REPO_TOKEN` to travis, this is used by
  the coveralls bin.

4. add the following to your `.travis.yml`:

```yaml
after_success: npm run coverage
```

That's all there is to it!

_Note: by default coveralls.io adds comments to pull-requests on GitHub, this can
feel intrusive. To disable this, click on your repo on coveralls.io and uncheck `LEAVE COMMENTS?`._
