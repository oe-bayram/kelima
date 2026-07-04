module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: 'nativewind' enables className on React Native components.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // NOTE: Do NOT add 'react-native-worklets/plugin' or 'react-native-reanimated/plugin'.
    // On Expo SDK 57 babel-preset-expo auto-injects the worklets/reanimated Babel plugin
    // (and the React Compiler, enabled via app.json) and guarantees correct ordering.
  };
};
