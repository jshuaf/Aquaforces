'use strict';
const config = {
	port: 3000
};
require('./essentials.js');
require('colors');
const http = require('http'),
	uglifyJS = require('uglify-js'),
	CleanCSS = require('clean-css'),
	zlib = require('zlib'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	querystring = require('querystring'),
	cookie = require('cookie'),
	crypto = require('crypto');
let statics = JSON.parse(fs.readFileSync('./statics.json'));
global.dbcs = {};
const usedDBCs = ['questions'];
global.errorForbidden = function(req, res, msg) {
	respondPage('403', req, res, o(function*() {
		res.write('<h1>Error 403</h1>');
		res.write(msg || '<p>Permission denied.</p>');
		res.write('<p><a href="javascript:history.go(-1)">Go back</a>.</p>');
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	}), {}, 403);
};
global.errorNotFound = function(req, res) {
	respondPage('404', req, res, o(function*() {
		res.write('<h1>Error 404 :(</h1>');
		res.write('<p>The requested file could not be found.</p>');
		res.write('<p><a href="javascript:history.go(-1)">Go back</a>.</p>');
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	}), {}, 404);
};
global.respondPage = o(function*(title, req, res, callback, header, status) {
	if (title) title = html(title);
	if (!header) header = {};
	let inhead = (header.inhead || '') + (header.description ? '<meta name="description" content="' + html(header.description) + '" />' : '');
	delete header.inhead;
	delete header.description;
	if (typeof header['Content-Type'] != 'string') header['Content-Type'] = 'application/xhtml+xml; charset=utf-8';
	if (typeof header['Cache-Control'] != 'string') header['Cache-Control'] = 'no-cache';
	if (typeof header['X-Frame-Options'] != 'string') header['X-Frame-Options'] = 'DENY';
	if (typeof header['Vary'] != 'string') header['Vary'] = 'Cookie';
	res.writeHead(status || 200, header);
	let data = (yield fs.readFile('./html/a/head.html', yield)).toString();
	res.write(yield addVersionNonces(data.replace('$title', (title ? title + ' · ' : '') + 'Aquaforces').replace('$inhead', inhead), req.url.pathname, yield));
	callback();
});
let cache = {};
let serverHandler = o(function*(req, res) {
	req.url = url.parse(req.url, true);
	let i;
	if (i = statics[req.url.pathname]) {
		yield respondPage(i.title, req, res, yield, {inhead: i.inhead});
		res.write((yield addVersionNonces((yield fs.readFile(i.path, yield)).toString(), req.url.pathname, yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (req.url.pathname.includes('.')) {
		let stats;
		try {
			stats = yield fs.stat('./http/' + req.url.pathname, yield);
		} catch (e) {
			return errorNotFound(req, res);
		}
		if (!stats.isFile()) return errorNotFound(req, res);
		let raw = !req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip') || req.headers['accept-encoding'].includes('gzip;q=0');
		if (cache[req.url.pathname]) {
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(req.url.pathname)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				'Vary': 'Accept-Encoding',
				'ETag': cache[req.url.pathname].hash
			});
			res.end(cache[req.url.pathname][raw ? 'raw' : 'gzip']);
			if (cache[req.url.pathname].updated < stats.mtime) {
				let data;
				try {
					data = yield fs.readFile('http' + req.url.pathname, yield);
				} catch (e) {
					return;
				}
				switch (path.extname(req.url.pathname)) {
					case '.js': data = uglifyJS.minify(data.toString(), {fromString: true}).code;
					break;
					case '.css': data = new CleanCSS().minify(data).styles;
					break;
				}
				cache[req.url.pathname] = {
					raw: data,
					gzip: data == cache[req.url.pathname].raw ? cache[req.url.pathname].gzip : yield zlib.gzip(data, yield),
					hash: yield getVersionNonce('/', req.url.pathname, yield),
					updated: stats.mtime
				};
			}
		} else {
			let data;
			try {
				data = yield fs.readFile('http' + req.url.pathname, yield);
			} catch (e) {
				return errorNotFound(req, res);
			}
			switch (path.extname(req.url.pathname)) {
				case '.js': data = uglifyJS.minify(data.toString(), {fromString: true}).code;
				break;
				case '.css': data = new CleanCSS().minify(data).styles;
				break;
			}
			cache[req.url.pathname] = {
				raw: data,
				gzip: yield zlib.gzip(data, yield),
				hash: yield getVersionNonce('/', req.url.pathname, yield),
				updated: stats.mtime
			};
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(req.url.pathname)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				'Vary': 'Accept-Encoding'
			});
			res.end(cache[req.url.pathname][raw ? 'raw' : 'gzip']);
		}
	} else return errorNotFound(req, res);
});
let server = http.createServer(serverHandler).listen(config.port);
console.log('Aquaforces running on port 3000 over plain HTTP.'.cyan);
require('./sockets.js')(server);
console.log('Sockets running on port 3000 over plain WS.'.cyan);
if (process.argv.indexOf('--test') >= 0) {
	console.log('Running test, process will terminate when finished.'.yellow);
	http.get({
		port: config.port,
		headers: {host: 'localhost'}
	}, function(testRes) {
		testRes.on('data', function(d) {
			console.log('Data received (' + d.length + ' char' + (d.length == 1 ? '' : 's') + '):' + ('\n> ' + d.toString().replaceAll('\n', '\n> ')).grey);
		});
		testRes.on('end', function() {
			console.log('HTTP test passed, starting socket test.'.green);
			let WS = require('ws');
			let wsc = new WS('ws://localhost:' + config.port + '/test');
			wsc.on('open', function() {
				console.log('Connected to socket.');
			});
			wsc.on('data', function(d) {
				console.log('Data received (' + d.length + ' char' + (d.length == 1 ? '' : 's') + '):' + ('\n> ' + d.toString().replaceAll('\n', '\n> ')).grey);
			});
			wsc.on('close', function() {
				console.log('Things seem to work!'.green);
				process.exit();
			});
		});
	});
}