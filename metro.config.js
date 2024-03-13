// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts.filter(extension => extension !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'cjs'];
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.transformer.getTransformOptions().then((transformer) => {
    transformer = {
        transform: {
            inlineRequires: true
        }
    }
});

module.exports = config;