const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const resolveAliases = {
  '@arkade-os/sdk/adapters/expo': path.join(__dirname, 'node_modules/@arkade-os/sdk/dist/cjs/adapters/expo.js'),
  'expo/fetch': path.join(__dirname, 'util/expo-fetch.js'),
};

/**
 * Metro configuration for Expo
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Add custom resolver configuration
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tcp-socket'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (resolveAliases[moduleName])
    return {
      type: 'sourceFile',
      filePath: resolveAliases[moduleName],
    };

  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Add better error reporting and source maps
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

module.exports = config;