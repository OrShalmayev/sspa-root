// Important modules this config uses
const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackBase       = require('./webpack.base');
const TerserPlugin      = require('terser-webpack-plugin');

module.exports = webpackBase.init({
    // In production, we skip all hot-reloading stuff
    entry:        {
        main: {
            import: './src/app.js'
        }
    },
    output:       {
        publicPath:    '/root/',
        filename:      '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
    },
    optimization: {
        minimize:  true,
        minimizer: [
            new TerserPlugin({
                parallel:        true,
                terserOptions:   {
                    mangle: true
                },
                extractComments: false,
            }),
        ]
    },
    plugins:      [
        // Minify and optimize the index.html
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            minify:   {
                removeComments:                true,
                collapseWhitespace:            true,
                removeRedundantAttributes:     true,
                useShortDoctype:               true,
                removeEmptyAttributes:         true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash:              true,
                minifyJS:                      true,
                minifyCSS:                     true,
                minifyURLs:                    true,
            },
            inject:   true,
            favicon:  'src/favicon.ico'
        })
    ]
});
