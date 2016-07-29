'use strict';
const fs = require('fs');
/*eslint-disable no-process-env*/
const config = {
	port: process.env.PORT || (process.argv.includes('--production') ? 80 : 3000),
	mongoPath: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/Aquaforces',
	secureCookies: false,
	googleAuth: {
		'client_id': process.argv.includes('--test') ? '' : process.env.GITHUB_CLIENT_ID || fs.readFileSync('./github.pem').toString().split('\n')[0],
		'client_secret': process.argv.includes('--test') ? '' : process.env.GITHUB_CLIENT_SECRET || fs.readFileSync('./github.pem').toString().split('\n')[1]
	}
};
/*eslint-enable no-process-env*/
require('./essentials.js');
require('colors');
global.dbcs = {};
const usedDBCs = ['qsets', 'users'];

const http = require('http'),
	https = require('https'),
	uglifyJS = require('uglify-js'),
	CleanCSS = require('clean-css'),
	zlib = require('zlib'),
	path = require('path'),
	url = require('url'),
	querystring = require('querystring'),
	cookie = require('cookie'),
	crypto = require('crypto'),
	mongo = require('mongodb').MongoClient;
let statics = JSON.parse(fs.readFileSync('./statics.json'));
const apiServer = require('./api.js');
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
	let inhead = (header.inhead || '') + (header.description ? '<meta name="description" content="' + html(header.description) + '" />' : ''),
		noBG = header.noBG;
	delete header.inhead;
	delete header.description;
	delete header.noBG;
	if (typeof header['Content-Type'] != 'string') header['Content-Type'] = 'application/xhtml+xml; charset=utf-8';
	if (typeof header['Cache-Control'] != 'string') header['Cache-Control'] = 'no-cache';
	if (typeof header['X-Frame-Options'] != 'string') header['X-Frame-Options'] = 'DENY';
	if (typeof header['Vary'] != 'string') header['Vary'] = 'Cookie';
	res.writeHead(status || 200, header);
	let data = (yield fs.readFile('./html/a/head.html', yield)).toString();
	res.write(yield addVersionNonces(data.replace('xml:lang="en"', noBG ? 'xml:lang="en" class="no-bg"' : 'xml:lang="en"').replace('$title', (title ? title + ' · ' : '') + 'Aquaforces').replace('$inhead', inhead), req.url.pathname, yield));
	callback();
});
global.errorsHTML = function(errs) {
	return errs.length ?
		(
			errs.length == 1 ?
				'<div class="error">' + errs[0] + '</div>'
				: '<div class="error">\t<ul>\t\t<li>' + errs.join('</li>\t\t<li>') + '</li>\t</ul></div>'
		)
		: '';
};
let cache = {};
const redirectURLs = ['/host', '/play', '/console'];
let serverHandler = o(function*(req, res) {
	req.url = url.parse(req.url, true);
	console.log(req.method, req.url.pathname);
	let i;
	if (i = statics[req.url.pathname]) {
		yield respondPage(i.title, req, res, yield, {inhead: i.inhead});
		res.write((yield addVersionNonces((yield fs.readFile(i.path, yield)).toString(), req.url.pathname, yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (req.url.pathname.substr(0, 5) == '/api/') {
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
			try {
				switch (path.extname(req.url.pathname)) {
					case '.js': data = uglifyJS.minify(data.toString(), {fromString: true}).code;
					break;
					case '.css': data = new CleanCSS().minify(data).styles;
					break;
				}
			} catch (e) {
				console.error(e);
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
	} else if (req.url.pathname == '/') {
		yield respondPage(null, req, res, yield, {inhead: '<link rel="stylesheet" href="/landing.css" />'});
		res.write((yield fs.readFile('./html/landing.html', yield)).toString().replace('$googleClientID', config.googleAuth.client_id));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (req.url.pathname == '/host/') {
		let user = yield dbcs.users.findOne({
			cookie: {
				$elemMatch: {
					token: cookie.parse(req.headers.cookie || '').id || 'nomatch',
					created: {$gt: new Date() - 2592000000}
				}
			}
		}, yield);
		yield respondPage('Question Sets', req, res, yield, {inhead: '<link rel="stylesheet" href="/host.css" />', noBG: true});
		let qsetstr = '';
		const requestCookies = req.headers.cookie || '';
		dbcs.qsets.find({$or: [{userID: user._id}, {public: true}]}).sort({timeAdded: -1}).each(o(function*(err, qset) {
			if (err) throw err;
			if (qset) {
				qsetstr += '<details class="qset" id="qset-' + qset._id + '"><summary><h2>' + html(qset.title) + '</h2> <small><a class="play">▶Play</a> <a class="dup">Duplicate</a> <a class="delete" title="delete">✕</a> <a href="#qset-' + qset._id + '" title="permalink">#</a></small></summary><ol>';
				qset.questions.forEach(function(question) {
					let listr = '<li><a class="edit" title="edit question">✎</a><h3>' + html(question.text) + '</h3><div><ul class="check-list">',
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
				let data = (yield fs.readFile('./html/host.html', yield)).toString().replace('$qsets', qsetstr).replace('$googleClientID', config.googleAuth.client_id);
				if (user) data = data.replace(/<a.+?<\/a>/, 'Logged in as ' + user.name);
				res.write(data);
				res.end(yield fs.readFile('./html/a/foot.html', yield));
			}
		}));
	} else if (req.url.pathname == '/login/google') {
		let tryagain = '<a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=' + config.googleAuth.client_id + '&amp;response_type=code&amp;scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me&amp;redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2Fgoogle">Try again.</a>';
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
			console.log(data);
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
					res.write('<p>An invalid response was recieved from the Google API. ' + tryagain + '</p>');
					res.end(yield fs.readFile('html/a/foot.html', yield));
				}
				if (apiData.error) {
					yield respondPage('Login Error', user, req, res, yield, {}, 500);
					res.write('<h1>Login Error</h1>');
					res.write('<p>An error was recieved from the Google API. ' + tryagain + '</p>');
					res.write(errorsHTML([apiData.error + ': ' + apiData.error_description]));
					return res.end(yield fs.readFile('html/a/foot.html', yield));
				}
				console.log(apiData);
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
	} else if (redirectURLs.includes(req.url.pathname)) {
		res.writeHead(303, {'Location': req.url.pathname + '/'});
		res.end();
	} else return errorNotFound(req, res);
});
console.log('Connecting to mongodb…'.cyan);
mongo.connect(config.mongoPath, function(err, db) {
	if (err) throw err;
	let i = usedDBCs.length;
	function handleCollection(err, collection) {
		if (err) throw err;
		dbcs[usedDBCs[i]] = collection;
	}
	while (i--) db.collection(usedDBCs[i], handleCollection);
	console.log('Connected to mongodb.'.cyan);
	let server = http.createServer(serverHandler).listen(config.port);
	console.log(('Aquaforces running on port ' + config.port + ' over plain HTTP.').cyan);
	require('./sockets.js')(server);
	console.log(('Sockets running on port ' + config.port + ' over plain WS.').cyan);
	dbcs.qsets.update({}, {$set: {public: true}}, {multi: true});
	if (process.argv.includes('--test')) {
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
});