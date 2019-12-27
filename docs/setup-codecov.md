# Integrating with codecov.io

[codecov](https://codecov.io/) is a great tool for adding coverage reports to your GitHub project, even viewing them inline on GitHub with a [browser extension](https://docs.codecov.io/docs/browser-extension).

## Quick start

Assuming your `npm test` does not run `nyc` and you have the `npx` executable (npm v5.2+), have your CI runner execute the following:

```shell
npx nyc --reporter=lcov npm test && npx codecov
```

## Without `npx` - Travis CI example using npm scripts

1. add the codecov and nyc dependencies:

  ```shell
  npm install codecov nyc --save-dev
  ```

2. update the scripts in your package.json to include these lines (replace `mocha` with your test runner):

  ```json
  {
     "scripts": {
       "test": "nyc --reporter=lcov mocha",
       "coverage": "codecov"
     }
  }
  ```

3. For private repos, add the environment variable `CODECOV_TOKEN` to Travis CI.

4. add the following to your `.travis.yml`:

  ```yaml
  after_success: npm run coverage
  ```
