const path = require('path');
const webpack = require('webpack');

module.exports = {
	cache: true,
	devtool: 'eval',
	entry: {
		host: './http/host/index.jsx',
		game: './http/game/index.jsx',
		console: './http/console/index.jsx',
		main: './http/a/scripts/index.js',
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
					cacheDirectory: true,
					presets: ['es2015', 'react'],
					plugins: ['transform-object-rest-spread'],
				},
			},
			{
				test: /\.json$/,
				loader: 'json-loader',
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
	plugins: [
		new webpack.DllReferencePlugin({
			context: path.join(__dirname),
			/* eslint-disable global-require */
			manifest: require('./dll/vendor-manifest.json'),
			/* eslint-enable global-require */
		}),
	],
};
