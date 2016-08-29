const path = require('path');

module.exports = {
	entry: {
		host: './http/host/index.jsx',
		game: './http/game/index.jsx',
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
				include: path.join(__dirname, 'http'),
				query: {
					presets: ['es2015', 'react'],
					plugins: ['transform-object-rest-spread'],
				},
			},
			{
				test: /\.json$/,
				loader: 'json-loader',
				include: path.join(__dirname, 'http'),
			},
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
