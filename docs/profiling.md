
## Profiling:

The self-coverage tool can provide a [fairly interesting information on how nyc performs](https://github.com/bcoe/nyc/pull/101#issuecomment-165337057) in real world test suites. Doing this is a bit involved, detailed steps follow.

*Note:* This assumes your locally cloned development version of `nyc` is in `/user/dev/nyc`, and that you are profiling against the AVA test suite in `/user/dev/ava`. Adapt as required.

### Initial Setup (NYC)

We must use `npm link`, and ensure we have fresh "self-coverage" scripts generated.

```sh
# Go to the local clone of nyc
$ cd /user/dev/nyc

# Link the local clone globally
$ npm link

# Create the self-coverage instrumented files
$ node ./build-self-coverage
```

### Initial Setup (Test Project)

```sh
# CD to the real world test suite you want to profile against
$ cd /user/dev/ava

# Link the globally linked nyc into your local node_modules
$ npm link nyc
```

This will likely not work with `tap --coverage`, since tap will try to use it's own older copy of nyc instead of your globally linked one. Modify the test script in your test project so it uses the `nyc` binary directly, and disable `tap`s version with the `--no-cov` flag:

 `package.json`:

 ```json
 {
   "scripts" : {
     "test": "nyc tap --no-cov test/*.js"
   }
 }
 ```
### Each Run

```sh
# Clear existing self coverage (`trash` ~== `rm -rf`)
$ cd /user/dev/nyc
$ trash ./.self_coverage

# Clear the `.nyc_cache` folder in your test project
$ cd /user/dev/ava
$ trash ./.nyc_cache

# Run your test suite
$ npm test

# Go back to the `nyc` folder and create a self-coverage report
$ cd /user/dev/nyc
$ npm run report
```

A detailed profile of your test run now exists in `/user/dev/nyc/coverage/lcov-report`

*Note: * `trash` is a safer version of `rm -rf`. Install via `npm i -g trash-cli`. [More info](https://github.com/sindresorhus/guides/blob/master/how-not-to-rm-yourself.md).

### WARNING: Self coverage can cause some confusing problems.

If `index.covered.js` exists, it will be used instead of the normal file. This means your changes to `index.js` will not have an effect until you recreate or delete the self coverage files. Unless you are trying to do some profiling, you should probably delete them so the regular files are used.

You can delete the self coverage scripts and use the regular ones as follows:

```sh
# Go to nyc directory and remove the self coverage scripts
$ cd /user/dev/nyc
$ npm run clean
```

You can rerun `node ./build-self-coverage` scripts as desired to re-enable self-coverage.

