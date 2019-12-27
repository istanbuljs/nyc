# Integrating with coveralls.io

[coveralls.io](https://coveralls.io) is a great tool for adding
coverage reports to your GitHub project. Here's how to get nyc
integrated with coveralls and travis-ci.org:

1. add the coveralls and nyc dependencies to your module:

  ```shell
  npm install coveralls nyc --save-dev
  ```

2. update the scripts in your package.json to include these bins:

  ```json
  {
     "scripts": {
       "test": "nyc mocha",
       "coverage": "nyc report --reporter=text-lcov | coveralls"
     }
  }
  ```

3. For private repos, add the environment variable `COVERALLS_REPO_TOKEN` to Travis CI.

4. add the following to your `.travis.yml`:

  ```yaml
  after_success: npm run coverage
  ```

That's all there is to it!

> Note: by default coveralls.io adds comments to pull-requests on GitHub, this can feel intrusive. To disable this, click on your repo on coveralls.io and uncheck `LEAVE COMMENTS?`.
