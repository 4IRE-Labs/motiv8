const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// const bootstrapEntryPoints = require('./webpack.bootstrap.config.js');


// eslint-disable-next-line no-console
// console.log(`=> bootstrap-loader configuration: ${bootstrapEntryPoints.dev}`);

module.exports = {
    entry: './app/javascripts/app.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js'
    },
    plugins: [
        // Copy our app's index.html to the build folder.
        new CopyWebpackPlugin([
            {from: './app/index.html', to: "index.html"},
            {from: './app/index1.html', to: "index1.html"},

            // images
            {from: './app/images/add-icon.svg', to: "images/add-icon.svg"},
            {from: './app/images/card-img-1.svg', to: "images/card-img-1.svg"},
            {from: './app/images/card-img-2.svg', to: "images/card-img-2.svg"},
            {from: './app/images/card-img-3.svg', to: "images/card-img-3.svg"},
            {from: './app/images/image.png', to: "images/image.png"},
            {from: './app/images/loading.png', to: "images/loading.png"},
            {from: './app/images/logo.svg', to: "images/logo.svg"},

            // css
            {from: './app/stylesheets/bootstrap.css', to: "css/bootstrap.css"},
            {from: './app/stylesheets/main.css', to: "css/main.css"}
        ]),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
    ],
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader']},
            {test: /\.scss$/, use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']},
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader?limit=10000',
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                use: 'file-loader',
            }
            // ,
            //
            // // Bootstrap 3
            // {test: /bootstrap-sass\/assets\/javascripts\//, use: 'imports-loader?jQuery=jquery'},

        ],
        loaders: [
            {test: /\.json$/, use: 'json-loader'},
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            }
        ]
    }
}
