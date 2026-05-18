module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // ANTI-PATTERN: the plugin path moved to 'react-native-worklets/plugin' in Reanimated 4 (SDK 54+).
    plugins: ["react-native-reanimated/plugin"],
  };
};
