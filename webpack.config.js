const path = require('path');

module.exports = {
	entry: {
		host: './http/host/host.jsx',
		game: './http/game/game.jsx',
	},
	output: {
		path: path.join(__dirname, '/http'),
		filename: '[name].bundle.js',
	},
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'react'],
				},
			},
		],
	},
};
