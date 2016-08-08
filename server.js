'use strict';

/* eslint-disable no-process-env */
global.config = {
	port: process.env.PORT || (process.argv.includes('--production') ? 80 : 3000),
	mongoPath: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/Aquaforces',
	secureCookies: false,
	googleAuth: {
		client_id: process.argv.includes('--test') ? '' : '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com',
		client_secret: process.argv.includes('--test') ? '' : 'sW_Qt7Lj63m5Bshun_kdnJvt'
	}
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
const redirectURLs = ['/host', '/play', '/console', ''];

let serverHandler = o(function*(req, res) {
	// Redirect from www.aquaforces.com to aquaforces.com
	if (req.headers.host.includes('www')) {
		res.writeHead(301, {Location: '//' + req.headers.host.replace('www.', '') + req.url});
		res.end();
	}

	req.url = url.parse(req.url, true);
	let i;

	// Set constants based on request
	let reqPath = req.url.pathname;
	const usesIODomain = reqPath.includes('.io');

	// Find the logged-in user
	const user = yield dbcs.users.findOne({
		cookie: {
			$elemMatch: {
				token: cookie.parse(req.headers.cookie || '').id || 'nomatch',
				created: {$gt: new Date() - 2592000000}
			}
		}
	}, yield);

	// MARK: respond based on request URL
	if (reqPath.substr(0, 5) == '/api/' && !usesIODomain) {
		// API Request
		// Slice off the /api
		reqPath = reqPath.substr(4);
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
	} else if (reqPath.includes('.')) {
		// Static file serving
		let stats;
		try {
			stats = yield fs.stat('./http/' + reqPath.replaceAll('.js', '.jsx'), yield);
		} catch (e) {
			return errorNotFound(req, res);
		}
		if (!stats.isFile()) return errorNotFound(req, res);
		let raw = !req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip') || req.headers['accept-encoding'].includes('gzip;q=0');

		// Serve from cache
		if (cache[reqPath]) {
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(reqPath)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				'Vary': 'Accept-Encoding',
				'ETag': cache[reqPath].hash
			});
			res.end(cache[reqPath][raw ? 'raw' : 'gzip']);
			if (cache[reqPath].updated < stats.mtime) {
				let data;
				try {
					data = yield fs.readFile('http' + reqPath.replaceAll('.js', '.jsx'), yield);
				} catch (e) {
					return;
				}

				// Handle file types when serving updated file from cache
				switch (path.extname(reqPath)) {
					case '.js': data = uglifyJS.minify(babel.transform(data.toString(), {presets: ['react', 'es2015']}).code, {fromString: true}).code;
					break;
					case '.css': data = new CleanCSS().minify(data).styles;
					break;
				}
				cache[reqPath] = {
					raw: data,
					gzip: data == cache[reqPath].raw ? cache[reqPath].gzip : yield zlib.gzip(data, yield),
					hash: yield getVersionNonce('/', reqPath, yield),
					updated: stats.mtime
				};
			}
		} else {
			// Serve uncached data
			let data;
			try {
				data = yield fs.readFile('http' + reqPath.replaceAll('.js', '.jsx'), yield);
			} catch (e) {
				return errorNotFound(req, res);
			}
			switch (path.extname(reqPath)) {
				case '.js': data = uglifyJS.minify(babel.transform(data.toString(), {presets: ['react', 'es2015']}).code, {fromString: true}).code;
				break;
				case '.css': data = new CleanCSS().minify(data).styles;
				break;
			}
			cache[reqPath] = {
				raw: data,
				gzip: yield zlib.gzip(data, yield),
				hash: yield getVersionNonce('/', reqPath, yield),
				updated: stats.mtime
			};
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(reqPath)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				'Vary': 'Accept-Encoding'
			});
			res.end(cache[reqPath][raw ? 'raw' : 'gzip']);
		}
	} else if (reqPath == '/play/' || (usesIODomain && reqPath == '/')) {
		// Gameplay screen
		yield respondPage(null, req, res, yield);
		res.write((yield addVersionNonces((yield fs.readFile('./html/play.html', yield)).toString(), reqPath, yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (reqPath == '/') {
		// Landing page
		if (user) {
			// Redirect user if they're logged in
			return res.writeHead(303, {Location: '/host/'}) || res.end();
		}
		yield respondPage(null, req, res, yield, {inhead: '<link rel="stylesheet" href="/landing.css" />'});
		res.write((yield fs.readFile('./html/landing.html', yield)).toString().replaceAll('$host', encodeURIComponent('http://' + req.headers.host)).replaceAll('$googleClientID', config.googleAuth.client_id));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (reqPath == '/host/' && !usesIODomain) {
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

		// Perform the search in the database
		searchText = searchText.trim();
		if (searchText) filter.$text = {$search: searchText};
		dbcs.qsets.find(filter, searchText ? {score: {$meta: 'textScore'}} : undefined).sort(searchText ? {score: {$meta: 'textScore'}} : {timeAdded: -1}).each(o(function*(err, qset) {
			if (err) throw err;

			// MARK: ugly html insertion, will later be replaced by React
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
				let data = (yield fs.readFile('./html/host.html', yield)).toString()
					.replace('$qsets', qsetstr || '<p class="empty-search">No question sets matched your search.</p>')
					.replaceAll('$host', encodeURIComponent('http://' + req.headers.host)).replaceAll('$googleClientID', config.googleAuth.client_id);
				if (user) data = data.replace(/<a class="signin-link"[\s\S]+?<\/a>/, '<a id="menu-stub">' + html(user.name) + '</a>').replace('<nav>', '<nav class="loggedin">');
				else data = data.replace('id="filter"', 'id="filter" hidden=""');
				if (q) data = data.replace('autofocus=""', 'autofocus="" value="' + html(q) + '"');
				res.write(data);
				res.end(yield fs.readFile('./html/a/foot.html', yield));
			}
		}));
	} else if (reqPath == '/login/google' && !usesIODomain) {
		// Redirect URI after attempted Google login
		let tryagain = '<a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=' + config.googleAuth.client_id + '&amp;response_type=code&amp;scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me&amp;redirect_uri=' + encodeURIComponent('http://' + req.headers.host) + '%2Flogin%2Fgoogle">Try again.</a>';
		if (req.url.query.error) {
			yield respondPage('Login Error', req, res, yield, {}, 400);
			res.write('<h1>Login Error</h1>');
			res.write('<p>An error was received from Google. ' + tryagain + '</p>');
			res.write(errorsHTML(['Error: ' + req.url.query.error]));
			return res.end(yield fs.readFile('html/a/foot.html', yield));
		}
		if (!req.url.query.code) {
			yield respondPage('Login Error', req, res, yield, {}, 400);
			res.write('<h1>Login Error</h1>');
			res.write('<p>No authentication code was received. ' + tryagain + '</p>');
			return res.end(yield fs.readFile('html/a/foot.html', yield));
		}
		let googReq = https.request({
			hostname: 'accounts.google.com',
			path: '/o/oauth2/token',
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, o(function*(googRes) {
			let data = '';
			googRes.on('data', function(d) {
				data += d;
			});
			yield googRes.on('end', yield);
			try {
				data = JSON.parse(data);
			} catch (e) {
				yield respondPage('Login Error', req, res, yield, {}, 500);
				res.write('<h1>Login Error</h1>');
				res.write('<p>An invalid response was received from Google. ' + tryagain + '</p>');
				res.end(yield fs.readFile('html/a/foot.html', yield));
			}
			if (data.error) {
				yield respondPage('Login Error', req, res, yield, {}, 500);
				res.write('<h1>Login Error</h1>');
				res.write('<p>An error was received from Google. ' + tryagain + '</p>');
				res.write(errorsHTML([data.error + ': ' + data.error_description]));
				return res.end(yield fs.readFile('html/a/foot.html', yield));
			}
			console.log('/plus/v1/people/me?key=' + encodeURIComponent(data.access_token));
			let apiReq = https.get({
				hostname: 'www.googleapis.com',
				path: '/plus/v1/people/me?access_token=' + encodeURIComponent(data.access_token)
			}, o(function*(apiRes) {
				let apiData = '';
				apiRes.on('data', function(d) {
					apiData += d;
				});
				yield apiRes.on('end', yield);
				try {
					apiData = JSON.parse(apiData);
				} catch (e) {
					yield respondPage('Login Error', user, req, res, yield, {}, 500);
					res.write('<h1>Login Error</h1>');
					res.write('<p>An invalid response was received from the Google API. ' + tryagain + '</p>');
					res.end(yield fs.readFile('html/a/foot.html', yield));
				}
				if (apiData.error) {
					yield respondPage('Login Error', user, req, res, yield, {}, 500);
					res.write('<h1>Login Error</h1>');
					res.write('<p>An error was received from the Google API. ' + tryagain + '</p>');
					res.write(errorsHTML([apiData.error + ': ' + apiData.error_description]));
					return res.end(yield fs.readFile('html/a/foot.html', yield));
				}
				console.log(apiData);

				// Store the user in the database and create a unique token
				let matchUser = yield dbcs.users.findOne({googleID: apiData.id}, yield),
					idToken = crypto.randomBytes(128).toString('base64');
				if (matchUser) {
					dbcs.users.update({googleID: apiData.id}, {
						$push: {
							cookie: {
								token: idToken,
								created: new Date().getTime()
							}
						},
						$set: {googleName: apiData.login}
					});
				} else {
					dbcs.users.insert({
						_id: generateID(),
						cookie: [{
							token: idToken,
							created: new Date().getTime()
						}],
						googleID: apiData.id,
						name: apiData.displayName
					});
				}

				// Finally, redirect to the host screen if login succeeds
				res.writeHead(303, {
					Location: '/host/',
					'Set-Cookie': cookie.serialize('id', idToken, {
						path: '/',
						expires: new Date(new Date().setDate(new Date().getDate() + 30)),
						httpOnly: true,
						secure: config.secureCookies
					})
				});
				res.end();
			}));
			apiReq.on('error', o(function*(e) {
				yield respondPage('Login Error', user, req, res, yield, {}, 500);
				res.write('<h1>Login Error</h1>');
				res.write('<p>HTTP error when connecting to the Google API: ' + e + ' ' + tryagain + '</p>');
				res.end(yield fs.readFile('html/a/foot.html', yield));
			}));
		}));
		googReq.end('client_id=' + config.googleAuth.client_id + '&client_secret=' + config.googleAuth.client_secret + '&code=' + encodeURIComponent(req.url.query.code) + '&redirect_uri=' + encodeURIComponent('http://' + req.headers.host + '/login/google') + '&grant_type=authorization_code');
		googReq.on('error', o(function*(e) {
			yield respondPage('Login Error', req, res, yield, {}, 500);
			res.write('<h1>Login Error</h1>');
			res.write('<p>HTTP error when connecting to Google: ' + e + ' ' + tryagain + '</p>');
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (reqPath == '/stats/' && !usesIODomain) {
		// Rudimentary statistics
		if (!user.admin) return errorNotFound(req, res);
		yield respondPage('Statistics', req, res, yield, {}, 400);
		dbcs.gameplays.aggregate({$match: {}}, {$group: {_id: 'stats', num: {$sum: 1}, sum: {$sum: '$participants'}}}, o(function*(err, result) {
			if (err) throw err;
			res.write('<h1>Aquaforces play statistics</h1>');
			res.write('<p>' + result[0].sum + ' users</p>');
			res.write('<p>' + result[0].num + ' gameplays</p>');
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (reqPath == '/status/') {
		// A status page to make sure Aquaforces is running
		yield respondPage('Status', req, res, yield);
		res.write('<h1>Aquaforces Status</h1>');
		let child = spawn('git', ['rev-parse', '--short', 'HEAD']);
		res.write('<p class="green"><strong>Running</strong>, commit #');
		child.stdout.on('data', function(data) {
			res.write(data);
		});
		child.stdout.on('end', o(function*() {
			res.write('</p>');
			if (user.name) res.write('<p>You are logged in as <strong>' + user.name + '</strong></p>');
			else res.write('<p>You are not logged in</p>');
			res.write('<p>Current host header is <strong>' + req.headers.host + '</strong></p>');
			res.write('<code class="blk" id="socket-test">Connecting to socket…</code>');
			res.write(yield addVersionNonces('<script src="/a/sockettest.js"></script>', reqPath, yield));
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (redirectURLs.includes(reqPath) && !usesIODomain) {
		// Redirect URLs without a trailing slash
		res.writeHead(303, {'Location': reqPath + '/'});
		res.end();
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
