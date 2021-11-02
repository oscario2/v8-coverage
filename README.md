# v8-coverage
Lightweight module for a quick overview in what branches were covered in code coverage. Uses the built-in `Profiler.startPreciseCoverage`.

More info about coverage [here](https://v8.dev/blog/javascript-code-coverage)

## Usage
```js
const { profile } = require("v8-coverage");
const { a } = require('./fn-from-module');

const args = [true];
profile(a, ...args);
```