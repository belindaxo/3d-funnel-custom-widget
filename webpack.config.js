const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports = {
    entry: ['./src/index.js', './src/aps_index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            { 
                test: /\.js$/, 
                exclude: /node_modules/, 
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Bold.woff'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Bold.woff'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Bold.woff2'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Regular.woff'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Regular.woff'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Regular.woff2'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Italic.woff'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Italic.woff'),
                },
                {
                    from: path.resolve(__dirname, 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2'),
                    to: path.resolve(__dirname, 'dist/fonts/72-Italic.woff2'),
                },
            ]
        })
    ]
}