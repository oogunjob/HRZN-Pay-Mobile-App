module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    'react-native-reanimated/plugin', // required by react-native-reanimated v2 - must be last
  ],
};
