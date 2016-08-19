const path = require('path');

module.exports = {
	entry: {
		host: './http/host/index.jsx',
		game: './http/game/game.jsx',
		console: './http/console/index.jsx',
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
			{ test: /\.json$/, loader: 'json-loader' },
		],
		noParse: /node_modules\/json-schema\/lib\/validate\.js/,
	},
	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
};
