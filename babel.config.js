// const ReactCompilerConfig = {};

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // ["babel-plugin-react-compiler", ReactCompilerConfig],
            "nativewind/babel",
            "react-native-reanimated/plugin",
        ],
    };
};
