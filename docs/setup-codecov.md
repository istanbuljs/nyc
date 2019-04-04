# Integrating with codecov.io

> **tl;dr**: 
> `nyc --reporter=lcov npm test && npx codecov`

[codecov](https://codecov.io/) is a great tool for adding
coverage reports to your GitHub project, even viewing them inline on GitHub with a browser extension:

Here's how to get `nyc` integrated with codecov and travis-ci.org, assuming you have the `npx` executable (included with npm v5.2 and above):

1. add the codecov and nyc dependencies to your module:

  ```shell
  npm install nyc --save-dev
  ```

2. update the scripts in your package.json to include these lines:

  ```json
  {
     "scripts": {
       "test": "nyc --reporter=lcov mocha ./test/*.js",
       "coverage": "npx codecov"
     }
  }
  ```

3. For private repos, add the environment variable `CODECOV_TOKEN` to travis.

4. add the following to your `.travis.yml`:

  ```yaml
  after_success: npm run coverage
  ```
