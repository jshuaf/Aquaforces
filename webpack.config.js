const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

module.exports = {
	cache: true,
	devtool: 'source-map',
	entry: {
		host: './http/host/index.jsx',
		game: './http/game/index.jsx',
		console: './http/console/index.jsx',
		main: './http/a/scripts/index.js',
	},
	output: {
		path: path.join(__dirname, '/http'),
		filename: '[name].[hash].bundle.js',
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
		function () {
			this.plugin('done', (stats) => {
				fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify(stats.toJson()));
				const chunkNames = require('./stats').assetsByChunkName
				const recent = [].concat.apply([], Object.keys(chunkNames)
					.map(chunkName => chunkNames[chunkName]))
				const files = fs.readdirSync('./http')
			  files.filter((name) => {
					return /\w+\.bundle\.js\.map/.test(name) || /\w+\.bundle\.js/.test(name)
				}).forEach((file) => {
					if (!(recent.indexOf(file) > 0)) {
						fs.unlink(`./http/${file}`);
					}
				});
			});
		},
	],
};
