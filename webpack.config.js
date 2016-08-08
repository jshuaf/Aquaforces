'use strict';
const path = require('path');

module.exports = {
	entry: {
		game: path.resolve('http/game/game.jsx'),
		host: path.resolve('http/host/GameHost.jsx')
	},
	output: {
		path: path.join(__dirname, "/http"),
		filename: "[name].bundle.js"
	},
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'react']
				}
			}
		]
	}
};