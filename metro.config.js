const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SVGs als React-Komponenten importierbar machen (react-native-svg-transformer).
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// input points at the single global stylesheet; inlineRem keeps rem-based
// utilities (spacing, text sizes) consistent with react-native-reusables.
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
