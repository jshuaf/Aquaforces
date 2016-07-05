'use strict';

var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.resolve(__dirname, 'http');
var GAME_DIR = path.resolve(__dirname, 'http/game');
var HOST_DIR = path.resolve(__dirname, 'http/host');

var config = {
  entry: {
    game: [GAME_DIR + '/game_components.jsx', GAME_DIR + '/game.jsx'],
    host: [HOST_DIR + '/host_components.jsx', HOST_DIR + '/host.jsx']
  },
  output: {
    path: APP_DIR,
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: [/\.jsx?/, /\.js?/],
        include: APP_DIR,
        loader: 'babel'
      }
    ]
  }
};

module.exports = config;