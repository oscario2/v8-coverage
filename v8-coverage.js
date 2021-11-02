const { promises: fs } = require('fs');
const { Session } = require('inspector');
const { promisify } = require('util');

const session = new Session();
if (session != null) {
    session.connect();
}

// https://v8.dev/blog/javascript-code-coverage
const run = promisify(session.post.bind(session));

/**
 * map offsets to each lines, only works with non-minified builds
 * useful for line-coverage or to cross-reference with e.g sourcemaps
 * @param {string} source 
 * @returns {{ start: number, end: number }} lines
 */
const getLines = (source) => {
    const lines = [];

    let state = { start: 0, end: 0 };
    for (let i = 0; i < source.length; i++) {
        if (source[i] == "\n") {
            if (state.start) {
                state.end = i;
                lines.push({ ...state });
            }
            state.start = i;
        }
    }

    return lines;
}

const formatCoverage = async ({ url, scriptId, functions }) => {
    if (!url.startsWith("file:///") || url.includes("v8-coverage.js")) return;

    const source = await fs.readFile(new URL(url), "utf8");
    const lines = getLines(source);

    for (let i = 0; i < functions.length; i++) {
        const { functionName, ranges } = functions[i];
        const state = {
            fn: functionName ? functionName : "anonymous",
            include: '',
            exclude: ''
        };

        ranges.forEach(({ startOffset, endOffset, count }) => {
            if (count == 0) {
                state.exclude = source.slice(startOffset, endOffset);
            } else {
                state.include = source.slice(startOffset, endOffset);
            }
        });

        console.log(state);
    }
}

/**
 * get coverage of function
 * @param {Function} fn 
 * @param  {...any} args 
 */
function profile(fn, ...args) {
    run('Profiler.enable')
        .then(() => run('Profiler.startPreciseCoverage', { detailed: true }))
        .then(() => fn(...args))
        .then(() => run('Profiler.takePreciseCoverage'))
        .then((data) => data.result.forEach(formatCoverage))
        .then(() => run('Profiler.stopPreciseCoverage'));
}

module.exports = { profile };

