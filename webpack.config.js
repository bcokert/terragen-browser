'use strict';
require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'static/js');

var config = {
    entry: APP_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        publicPath: '/static/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {test: /\.jsx?/, include: APP_DIR, loader: 'babel'},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.less/, loader: 'style!css!less'},
            {test: /\.json$/, loader: 'json'}
        ],
        noParse: [
            /plotly\.js/
        ]
    }
};

module.exports = config;
