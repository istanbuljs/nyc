# Writing a generic configuration generator class

It is possible to write a class which programmatically generates your nyc configuration.
In this case a `toNYCRC()` method should be provided which returns the actual configuration.

A simple example which allows you to append the default exclude list instead of replacing
it:

```js
'use strict';

const {defaultExclude} = require('test-exclude');

class ConfigGenerator {
    constructor() {
        this.settings = {
            all: true,
            exclude: [...defaultExclude]
        };
    }

    toNYCRC() {
        return this.settings;
    }

    fullCoverage(perFile = true) {
        Object.assign(this.settings, {
            checkCoverage: true,
            checkCoverage: true,
            perFile,
            lines: 100,
            statements: 100,
            functions: 100,
            branches: 100
        });

        return this;
    }


    exclude(...globs) {
        this.settings.exclude.push(...globs);

        return this;
    }
}

module.exports = () => new ConfigGenerator();
```

# Using your configuration generator

The following example assumes the above script was published as `@my-org/nyc-config`:

```js
'use strict';

module.exports = require('@my-org/nyc-config')()
    .fullCoverage(true)
    .exclude('build/**');
```

When the object created by `@my-org/nyc-config` is given to nyc the `toNYCRC()` method
is recognized and used to find the actual configuration.  Without `toNYCRC()` each package
which used `@my-org/nyc-config` to generate config would have to add `.settings` to the
end of the call chain.
