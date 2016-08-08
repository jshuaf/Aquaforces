'use strict';

/* eslint-disable no-process-env */
global.config = {
	port: process.env.PORT || (process.argv.includes('--production') ? 80 : 3000),
	mongoPath: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/Aquaforces',
	secureCookies: false/* ,
	googleAuth: {
		'client_id': process.argv.includes('--test') ? '' : process.env.GITHUB_CLIENT_ID || fs.readFileSync('./github.pem').toString().split('\n')[0],
		'client_secret': process.argv.includes('--test') ? '' : process.env.GITHUB_CLIENT_SECRET || fs.readFileSync('./github.pem').toString().split('\n')[1]
	}*/
};
/* eslint-enable no-process-env */

require('./essentials.js');
require('colors');

// Database Storage
global.dbcs = {};
const usedDBCs = ['users', 'gameplays'];

// Dependencies
const http = require('http'),
	https = require('https'),
	uglifyJS = require('uglify-js'),
	CleanCSS = require('clean-css'),
	babel = require('babel-core'),
	zlib = require('zlib'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	querystring = require('querystring'),
	cookie = require('cookie'),
	crypto = require('crypto'),
	mongo = require('mongodb').MongoClient;

const apiServer = require('./api.js');

// Response Pages

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
		res.write('<h1>Error 404</h1>');
		res.write('<p>The requested file could not be found.</p>');
		res.write('<p><a href="javascript:history.go(-1)">Go back</a>.</p>');
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	}), {}, 404);
};

global.respondPage = o(function*(title, req, res, callback, header, status) {
	// Parse the header
	if (title) title = html(title);
	if (!header) header = {};
	let inhead = (header.inhead || '') + (header.description ? '<meta name="description" content="' + html(header.description) + '" />' : '');
	let noBG = header.noBG;
	delete header.inhead;
	delete header.description;
	if (typeof header['Content-Type'] != 'string') header['Content-Type'] = 'application/xhtml+xml; charset=utf-8';
	if (typeof header['Cache-Control'] != 'string') header['Cache-Control'] = 'no-cache';
	if (typeof header['X-Frame-Options'] != 'string') header['X-Frame-Options'] = 'DENY';
	if (typeof header['Vary'] != 'string') header['Vary'] = 'Cookie';
	res.writeHead(status || 200, header);

	// All pages have headers, no navigation
	let data = (yield fs.readFile('./html/a/head.html', yield)).toString();

	try {
		res.write(yield addVersionNonces(
			data.replace('xml:lang="en"', noBG ? 'xml:lang="en" class="no-bg"' : 'xml:lang="en"')
			.replace('$title', (title ? title + ' · ' : '') + 'Aquaforces')
			.replace('$inhead', inhead), req.url.pathname, yield));
		return callback();
	} catch (e) {
		console.log(e);
	}
});

global.errorsHTML = function(errs) {
	if (errs.length == 1) {
		return '<div class="error">' + errs[0] + '</div>';
	} else if (errs.length) {
		return '<div class="error">\t<ul>\t\t<li>' + errs.join('</li>\t\t<li>') + '</li>\t</ul></div>';
	} else {
		return '';
	}
};

let cache = {};
const redirectURLs = ['/host', '/play', '/console'];

let serverHandler = o(function*(req, res) {
	if (req.headers.host.includes('www')) {
		res.writeHead(301, {Location: '//' + req.headers.host.replace('www.', '') + req.url});
		res.end();
	}

	req.url = url.parse(req.url, true);
	let i;

	// Find a user
	const user = yield dbcs.users.findOne({
		cookie: {
			$elemMatch: {
				token: cookie.parse(req.headers.cookie || '').id || 'nomatch',
				created: {$gt: new Date() - 2592000000}
			}
		}
	}, yield);

	// MARK: respond based on request URL
	if (req.url.pathname.substr(0, 5) == '/api/' && !req.headers.host.includes('io')) {
		// API Request
		req.url.pathname = req.url.pathname.substr(4);
		if (req.method != 'POST') return res.writeHead(405) || res.end('Error: Method not allowed. Use POST.');
		if (url.parse(req.headers.referer || '').host != req.headers.host) return res.writeHead(409) || res.end('Error: Suspicious request.');

		let post = '';
		req.on('data', function(data) {
			if (req.abort) return;
			post += data;
			if (post.length > 1e6) {
				res.writeHead(413);
				res.end('Error: Request entity too large.');
				req.abort = true;
			}
		});
		req.on('end', function() {
			if (req.abort) return;
			post = querystring.parse(post);
			apiServer(req, res, post);
		});
	} else if (req.url.pathname.includes('.')) {
		// Static file serving
		let stats;
		try {
			stats = yield fs.stat('./http/' + req.url.pathname.replaceAll('.js', '.jsx'), yield);
		} catch (e) {
			return errorNotFound(req, res);
		}
		if (!stats.isFile()) return errorNotFound(req, res);
		let raw = !req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip') || req.headers['accept-encoding'].includes('gzip;q=0');

		// Serve from cache
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
					data = yield fs.readFile('http' + req.url.pathname.replaceAll('.js', '.jsx'), yield);
				} catch (e) {
					return;
				}

				// Handle file types when serving updated file from cache
				switch (path.extname(req.url.pathname)) {
					case '.js': data = uglifyJS.minify(babel.transform(data.toString(), {presets: ['react', 'es2015']}).code, {fromString: true}).code;
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
		/* } else if (req.url.pathname == '/host/') {
			yield respondPage('Host', req, res, yield, {inhead: '<link rel="stylesheet" href="/host.css" />'});
			var qsetstr = '';
			dbcs.qsets.find({}, {title: true}).each(o(function*(err, qset) {
				if (err) throw err;
				if (qset) qsetstr += '<option value="' + qset._id + '">' + html(qset.title) + '</option>';
				else {
					res.write((yield fs.readFile('./html/host.html', yield)).toString().replace('$qsets', qsetstr));
					res.end(yield fs.readFile('./html/a/foot.html', yield));
				}
			}));*/
		} else {
			// Serve uncached data
			let data;
			try {
				data = yield fs.readFile('http' + req.url.pathname.replaceAll('.js', '.jsx'), yield);
			} catch (e) {
				return errorNotFound(req, res);
			}
			switch (path.extname(req.url.pathname)) {
				case '.js': data = uglifyJS.minify(babel.transform(data.toString(), {presets: ['react', 'es2015']}).code, {fromString: true}).code;
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
	} else if (req.url.pathname == '/play/' || (req.headers.host.includes('.io') && req.url.pathname == '/')) {
		// Gameplay screen
		yield respondPage(null, req, res, yield);
		res.write((yield addVersionNonces((yield fs.readFile('./html/play.html', yield)).toString(), req.url.pathname, yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (req.url.pathname == '/') {
		// Landing page
		if (user) {
			// Redirect user if they're logged in
			return res.writeHead(303, {Location: '/host/'}) || res.end();
		}
		yield respondPage(null, req, res, yield, {inhead: '<link rel="stylesheet" href="/landing.css" />'});
		res.write((yield fs.readFile('./html/landing.html', yield)).toString().replaceAll('$host', encodeURIComponent('http://' + req.headers.host)).replaceAll('$googleClientID', config.googleAuth.client_id));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (req.url.pathname == '/host/' && !req.headers.host.includes('.io')) {
		// Host console
		yield respondPage('Question Sets', req, res, yield, {inhead: '<link rel="stylesheet" href="/host.css" />', noBG: true});
		let qsetstr = '',
			filter = user ? {$or: [{userID: user._id}, {public: true}]} : {public: true},
			q = (req.url.query.q || '').trim(),
			searchText = '';

		// Edit filter based on search queries
		q.split(/\s+/).forEach(function(token) {
			if (token == 'is:mine' && user) filter.userID = user._id;
			if (token == 'is:public') filter.public = true;
			if (token == 'is:favorite' && user) filter._id = {$in: user.favorites};
			if (token == '-is:mine' && user) filter.userID = {$not: user._id};
			if (token == '-is:public') filter.public = false;
			if (token == '-is:favorite' && user) filter._id = {$not: {$in: user.favorites}};
			if (!token.includes(':')) searchText += token + ' ';
		});
		searchText = searchText.trim();
		if (searchText) filter.$text = {$search: searchText};
		dbcs.qsets.find(filter, searchText ? {score: {$meta: 'textScore'}} : undefined).sort(searchText ? {score: {$meta: 'textScore'}} : {timeAdded: -1}).each(o(function*(err, qset) {
			if (err) throw err;
			if (qset) {
				qsetstr += '<details class="qset" id="qset-' + qset._id + '"><summary><h2>' + html(qset.title) + '</h2> <small><a class="play">▶Play</a> <a class="dup">Duplicate</a> <a class="delete" title="delete"></a> <a href="#qset-' + qset._id + '" title="permalink">#</a></small></summary><ol>';
				qset.questions.forEach(function(question) {
					let listr = '<li><span class="q-ctrls"><a class="remove-q" title="delete question"></a> <a class="edit" title="edit question">✎</a></span><h3>' + html(question.text) + '</h3><div><ul class="check-list">',
						liestr = '<li class="q-edit" hidden=""><a class="discard" title="discard edits">✕</a><form>';
					liestr += '<label>Question <input placeholder="What\'s one plus one?" required="" maxlength="144" value="' + html(question.text) + '" /></label>';
					liestr += '<p>Answers:</p><ul>';
					question.answers.forEach(function(answer) {
						listr += '<li>' + html(answer) + '</li>';
						liestr += '<li><input type="checkbox" checked="" /> <input required="" maxlength="64" placeholder="Two" value="' + html(answer) + '" /></li>';
					});
					listr += '</ul><ul class="cross-list">';
					question.incorrectAnswers.forEach(function(answer) {
						listr += '<li>' + html(answer) + '</li>';
						liestr += '<li><input type="checkbox" /> <input required="" maxlength="64" placeholder="Two" value="' + html(answer) + '" /></li>';
					});
					listr += '</ul></div></li>';
					liestr += '<li><small><a class="more-wrong">+ more</a></small></li></ul><button class="submit-q-edit">Submit Edit</button></form></li>';
					qsetstr += listr + liestr;
				});
				qsetstr += '</ol><a class="new-question">add question</a></details>';
			} else {
				let data = (yield fs.readFile('./html/host.html', yield)).toString().replace('$qsets', qsetstr || '<p class="empty-search">No question sets matched your search.</p>').replaceAll('$host', encodeURIComponent('http://' + req.headers.host)).replaceAll('$googleClientID', config.googleAuth.client_id);
				if (user) data = data.replace(/<a class="signin-link"[\s\S]+?<\/a>/, '<a id="menu-stub">' + html(user.name) + '</a>').replace('<nav>', '<nav class="loggedin">');
				else data = data.replace('id="filter"', 'id="filter" hidden=""');
				if (q) data = data.replace('autofocus=""', 'autofocus="" value="' + html(q) + '"');
				res.write(data);
				res.end(yield fs.readFile('./html/a/foot.html', yield));
			}
		}));
	} else return errorNotFound(req, res);
});

// MARK: actually start the server
console.log('Connecting to mongodb…'.cyan);
mongo.connect(config.mongoPath, function(err, db) {
	if (err) throw err;

	db.createCollection('qsets', function(err, collection) {
		if (err) throw err;
		db.createIndex('qsets', {title: 'text'}, {}, function() {});
		dbcs.qsets = collection;
	});

	function handleCollection(err, collection) {
		if (err) throw err;
		dbcs[usedDBCs[i]] = collection;
	}

	// Go through the mongodb data and store it server-side
	let i = usedDBCs.length;
	while (i--) db.collection(usedDBCs[i], handleCollection);
	console.log('Connected to mongodb.'.cyan);
	let server = http.createServer(serverHandler).listen(config.port);
	console.log('Aquaforces running on port 3000 over plain HTTP.'.cyan);
	require('./sockets.js')(server);
	console.log('Sockets running on port 3000 over plain WS.'.cyan);

	// Rudimentary tests
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
				console.log(config.port);
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
});
