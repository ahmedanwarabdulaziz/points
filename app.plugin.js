const { withPlugins } = require('@expo/config-plugins');

/**
 * Custom config plugin for React Native Firebase with Expo
 */
module.exports = function withCustomConfig(config) {
  return withPlugins(config, [
    // Add any custom native configurations here
  ]);
};

