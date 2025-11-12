const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for React Native
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Reanimated 4.x usually works with default resolver settings
    sourceExts: [...getDefaultConfig(__dirname).resolver.sourceExts],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);