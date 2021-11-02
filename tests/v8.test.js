const { profile } = require("../index");
const { a } = require('./include_exclude');

const args = [true];
profile(a, ...args);