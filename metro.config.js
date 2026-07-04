const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// input points at the single global stylesheet; inlineRem keeps rem-based
// utilities (spacing, text sizes) consistent with react-native-reusables.
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
