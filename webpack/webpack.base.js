/**
 * COMMON WEBPACK CONFIGURATION
 */

const path                 = require('path');
const webpack              = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    init: function(options) {
        return {
            entry:        options.entry,
            mode:         process.env.NODE_ENV,
            output:       Object.assign({ // Compile into js/build.js
                path:     path.resolve(process.cwd(), 'build'),
                pathinfo: false
            }, options.output), // Merge with env dependent settings
            stats: {
                children: true
            },
            module:       {
                rules: [
                    {
                        test:    /\.js$/, // Transform all .js files required somewhere with
                                          // Babel
                        loader:  'babel-loader',
                        exclude: /(node_modules)/,
                        options: {
                            presets:        [
                                "@babel/preset-env"
                            ],
                            plugins:        ['@babel/plugin-proposal-class-properties'],
                            cacheDirectory: true
                        }
                    },
                    {
                        test: /\.(sa|sc|c)ss$/,
                        use:  [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader'
                            }, {
                                loader: 'resolve-url-loader'
                            }, {
                                loader:  'sass-loader',
                                options: {
                                    sourceMap: true
                                }
                            }
                        ]
                    },
                    {
                        test:    /\.(eot|svg|ttf|woff|woff2|ico)$/,
                        loader:  'file-loader',
                        options: {
                            esModule: false
                        }
                    },
                    {
                        test: /\.(jpg|png|gif)$/,
                        use:  [
                            {
                                loader:  'file-loader',
                                options: {
                                    esModule: false
                                }
                            },
                            {
                                loader: 'image-webpack-loader',
                                options:  {
                                    mozjpeg:  {
                                        progressive: true,
                                    },
                                    optipng:  {
                                        optimizationLevel: 7,
                                    },
                                    gifsicle: {
                                        interlaced: false,
                                    },
                                    pngquant: {
                                        quality: [0.65, 0.90],
                                        speed:   4,
                                    },
                                },
                            }
                        ]
                    },
                    {
                        test:    /\.html$/,
                        loader:  'html-loader'
                    }
                ]
            },
            optimization: Object.assign({
                emitOnErrors: false
            }, options.optimization),
            plugins:      options.plugins.concat([
                new MiniCssExtractPlugin({
                    filename:      '[contenthash].css',
                    chunkFilename: '[contenthash].css',
                    attributes:    {
                        application: 'root'
                    }
                }),
                new webpack.ProgressPlugin({
                    profile: true
                }),
                //use to fix moment.js module require
                new webpack.ContextReplacementPlugin(/\.\/locale$/, 'empty-module', false, /js$/),

                //        new webpack.ContextReplacementPlugin(
                //          /angular(\\|\/)core(\\|\/)@angular/,
                //          path.resolve(__dirname, '../src')
                //        )
            ]),
            resolve:      {
                modules:    ['node_modules'],
                extensions: [
                    '.js', '.ts', '.tsx', '*'
                ],
                mainFields: [
                    'browser',
                    'jsnext:main',
                    'main',
                ]
            },
            devtool:      options.devtool,
            watch:        options.watch,
            watchOptions: options.watchOptions,
            target:       'web', // Make web variables accessible to webpack, e.g.
                                 // window
            performance:  options.performance || {},
        }
    },
};
