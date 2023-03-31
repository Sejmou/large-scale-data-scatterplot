// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
const css = require('rollup-plugin-import-css');

module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.plugins.push(css());

    return config; // always return a config.
  },
};
