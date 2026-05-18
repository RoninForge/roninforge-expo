// ANTI-PATTERN: empty metro config; RN 0.79+ enables package.json exports by default
// and some libs ship broken dual CJS/ESM entries. No opt-out, no diagnostic.
const { getDefaultConfig } = require("@expo/metro-config");
module.exports = getDefaultConfig(__dirname);
