const { profile } = require("./v8-coverage.js");

// re-export to prevent renaming of 'v8-coverage.js' which is excluded from profiling
module.exports = { profile }