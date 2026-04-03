// @ts-check
/** @type {import('expo/metro-config').MetroConfig} */

// POLYFILL: Expo SDK 54/Metro requires Node 20's toReversed.
// If the user's terminal is running Node 18 (e.g. from Conda), we polyfill it here.
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
