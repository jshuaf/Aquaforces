const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		vendor: [path.join(__dirname, 'vendors.js')],
	},
	output: {
		path: path.join(__dirname, 'http', 'dll'),
		filename: 'dll.[name].js',
		library: '[name]',
	},
	plugins: [
		new webpack.DllPlugin({
			path: path.join(__dirname, 'dll', '[name]-manifest.json'),
			name: '[name]',
			context: path.resolve(__dirname),
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin(),
	],
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: 'json-loader',
			},
		],
		noParse: [/fsevents/, /node_modules\/json-schema\/lib\/validate\.js/],
	},
	resolve: {
		root: path.resolve(__dirname),
		modulesDirectories: ['node_modules'],
	},
	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		dns: 'empty',
		module: 'empty',
		child_process: 'empty',
	},
};
