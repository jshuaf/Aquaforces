/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* global dbcs:true */
const config = {
	port: process.argv.includes('--production') ? 80 : 3000,
	mongoPath: 'mongodb://localhost:27017/Aquaforces',
	googleAuth: {
		clientID: process.argv.includes('--test') ?
			'' : '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com',
		clientSecret: process.argv.includes('--test') ? '' : 'sW_Qt7Lj63m5Bshun_kdnJvt',
	},
};

const apiServer = require('./api');
// Database Storage
global.dbcs = {};
const usedDBCs = ['users', 'gameplays'];

// Dependencies
/* eslint-disable one-var */
require('./essentials')();
require('colors');

const http = require('http'),
	https = require('https'),
	CleanCSS = require('clean-css'),
	zlib = require('zlib'),
	fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn,
	url = require('url'),
	cookie = require('cookie'),
	crypto = require('crypto'),
	mongo = require('mongodb').MongoClient,
	WS = require('ws'),
	o = require('yield-yield'),
	jwt = require('jsonwebtoken'),
	express = require('express'),
	bodyParser = require('body-parser');
	/* eslint-enable one-var */

// Server Middleware
const initialMiddleware = {
	getUser: o(function* (req, res, next) {
		// Get the current logged-in user
		req.user = yield dbcs.users.findOne({
			cookie: {
				$elemMatch: {
					token: cookie.parse(req.headers.cookie || '').id || 'nomatch',
					created: { $gt: new Date() - 2592000000 },
				},
			},
		}, yield);
		next();
	}),
	foot: (req, res, next) => {
		res.locals.foot = fs.readFileSync('./html/a/foot.html').toString();
		next();
	},
	removeWWW: (req, res, next) => {
		let host = req.get('host');
		if (req.get('host').includes('www.')) {
			host = host.replaceAll('www.', '');
			const newURL = `${req.protocol}://${host}${req.originalUrl}`;
			res.redirect(301, newURL);
		}
		next();
	},
};

const head = (req, res, next) => {
	res.locals.head = fs.readFileSync('./html/a/head.html').toString()
		.replaceAll('$inhead', res.locals.inHead || '')
		.replaceAll('$title', res.locals.title || 'Aquaforces');
	next();
};

const cache = {};
const redirectURLs = ['/host', '/play', '/console', ''];

const app = express();
Object.keys(initialMiddleware).map((name) => app.use(initialMiddleware[name]));
app.use('/img', express.static('http/img'));
app.use('/a', express.static('http/a'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
	if (req.user) return res.redirect(302, '/host/');
	next();
}, head, (req, res) => {
	const host = encodeURIComponent(`http://${req.get('host')}`);
	const landingPage = fs.readFileSync('./html/landing.html');
	const landingPageHTML = landingPage.toString().replaceAll('$host', host)
		.replaceAll('$googleClientID', config.googleAuth.clientID);
	res.send(res.locals.head + landingPageHTML + res.locals.foot);
});

app.all('/api/:path', (req, res) => {
	return apiServer(req, res);
});


const serverHandler = o(function* (req, res) {
	// Redirect from www.aquaforces.com to aquaforces.com
	if (req.headers.host.includes('www')) {
		res.writeHead(301, { Location: '//' + req.headers.host.replace('www.', '') + req.url });
		res.end();
	}

	req.url = url.parse(req.url, true);

	// Set constants based on request
	const reqPath = req.url.pathname;
	const usesIODomain = reqPath.includes('.io');

	// Find the logged-in user
	// Check that the token was created more recently than 30 days ago

	// MARK: respond based on request URL
	if (reqPath.substr(0, 5) === '/api/' && !usesIODomain) {
		// API Request
		// Slice off the /api

		req.url.pathname = req.url.pathname.substr(4);
	} else if (reqPath.includes('.')) {
		// Static file serving
		let stats;
		try {
			stats = yield fs.stat('./http/' + reqPath, yield);
		} catch (e) {
			return errorNotFound(req, res);
		}
		if (!stats.isFile()) return errorNotFound(req, res);
		const raw = !req.headers['accept-encoding'] || !req.headers['accept-encoding'].includes('gzip') || req.headers['accept-encoding'].includes('gzip;q=0');

		// Serve from cache
		if (cache[reqPath]) {
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(reqPath)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				Vary: 'Accept-Encoding',
				ETag: cache[reqPath].hash,
			});
			res.end(cache[reqPath][raw ? 'raw' : 'gzip']);
			if (cache[reqPath].updated < stats.mtime) {
				let data;
				try {
					data = yield fs.readFile('http' + reqPath, yield);
				} catch (e) {
					return;
				}

				// Handle file types when serving updated file from cache
				if (path.extname(reqPath) === '.css') {
					data = new CleanCSS().minify(data).styles;
				}

				cache[reqPath] = {
					raw: data,
					gzip: data === cache[reqPath].raw ? cache[reqPath].gzip : yield zlib.gzip(data, yield),
					hash: yield getVersionNonce('/', reqPath, yield),
					updated: stats.mtime,
				};
			}
		} else {
			// Serve uncached data
			let data;
			try {
				data = yield fs.readFile('http' + reqPath, yield);
			} catch (e) {
				return errorNotFound(req, res);
			}

			// Handle file types when serving updated file from cache
			if (path.extname(reqPath) === '.css') {
				data = new CleanCSS().minify(data).styles;
			}

			cache[reqPath] = {
				raw: data,
				gzip: yield zlib.gzip(data, yield),
				hash: yield getVersionNonce('/', reqPath, yield),
				updated: stats.mtime,
			};
			res.writeHead(200, {
				'Content-Encoding': raw ? 'identity' : 'gzip',
				'Content-Type': (mime[path.extname(reqPath)] || 'text/plain') + '; charset=utf-8',
				'Cache-Control': 'max-age=6012800',
				Vary: 'Accept-Encoding',
			});
			res.end(cache[reqPath][raw ? 'raw' : 'gzip']);
		}
	} else if (reqPath === '/play/' || (usesIODomain && reqPath === '/')) {
		// Gameplay screen
		yield respondPage('Join a game', req, res, yield);
		res.write((yield addVersionNonces((yield fs.readFile('./html/play.html', yield)).toString(), reqPath, yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (reqPath === '/') {
		// Landing page
		if (user) {
			// Redirect user if they're logged in
			return res.writeHead(303, { Location: '/host/' }) || res.end();
		}
		yield respondPage(null, req, res, yield, { inhead: '' });
		res.write((yield fs.readFile('./html/landing.html', yield)).toString().replaceAll('$host', encodeURIComponent('http://' + req.headers.host)).replaceAll('$googleClientID', config.googleAuth.clientID));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (reqPath === '/console/' && !usesIODomain) {
		// Host console
		yield respondPage('Question Sets', req, res, yield, { inhead: '', noBG: true });
		const filter = user ? { $or: [{ userID: user._id }, { public: true }] } : { public: true };
		const q = (req.url.query.q || '').trim();
		let qsetstr = '';
		let searchText = '';

		// Edit filter based on search queries
		q.split(/\s+/).forEach((token) => {
			if (token === 'is:mine' && user) filter.userID = user._id;
			if (token === 'is:public') filter.public = true;
			if (token === 'is:favorite' && user) filter._id = { $in: user.favorites };
			if (token === '-is:mine' && user) filter.userID = { $not: user._id };
			if (token === '-is:public') filter.public = false;
			if (token === '-is:favorite' && user) filter._id = { $not: { $in: user.favorites } };
			if (!token.includes(':')) searchText += token + ' ';
		});

		// Perform the search in the database
		searchText = searchText.trim();
		if (searchText) filter.$text = { $search: searchText };
		dbcs.qsets.find(filter, searchText ? { score: { $meta: 'textScore' } } : undefined).sort(searchText ? { score: { $meta: 'textScore' } } : { timeAdded: -1 }).each(o(function* (err, qset) {
			if (err) throw err;

			// MARK: ugly html insertion, will later be replaced by React
			if (qset) {
				qsetstr += '<details class="qset" id="qset-' + qset._id + '"><summary><h2>' + html(qset.title) + '</h2> <small><a class="play">▶Play</a> <a class="dup">Duplicate</a> <a class="delete" title="delete"></a> <a href="#qset-' + qset._id + '" title="permalink">#</a></small></summary><ol>';
				qset.questions.forEach((question) => {
					let listr = '<li><span class="q-ctrls"><a class="remove-q" title="delete question"></a> <a class="edit" title="edit question">✎</a></span><h3>' + html(question.text) + '</h3><div><ul class="check-list">';
					let liestr = '<li class="q-edit" hidden=""><a class="discard" title="discard edits">✕</a><form>';
					liestr += '<label>Question <input placeholder="What\'s one plus one?" required="" maxlength="144" value="' + html(question.text) + '" /></label>';
					liestr += '<p>Answers:</p><ul>';
					question.answers.forEach((answer) => {
						listr += '<li>' + html(answer) + '</li>';
						liestr += '<li><input type="checkbox" checked="" /> <input required="" maxlength="64" placeholder="Two" value="' + html(answer) + '" /></li>';
					});
					listr += '</ul><ul class="cross-list">';
					question.incorrectAnswers.forEach((answer) => {
						listr += '<li>' + html(answer) + '</li>';
						liestr += '<li><input type="checkbox" /> <input required="" maxlength="64" placeholder="Two" value="' + html(answer) + '" /></li>';
					});
					listr += '</ul></div></li>';
					liestr += '<li><small><a class="more-wrong">+ more</a></small></li></ul><button class="submit-q-edit">Submit Edit</button></form></li>';
					qsetstr += listr + liestr;
				});
				qsetstr += '</ol><a class="new-question">add question</a></details>';
			} else {
				let data = (yield fs.readFile('./html/console.html', yield)).toString()
					.replace('$qsets', qsetstr || '<p class="empty-search">No question sets matched your search.</p>')
					.replaceAll('$host', encodeURIComponent(`http://${req.headers.host}`))
					.replaceAll('$googleClientID', config.googleAuth.clientID);
				if (q) data = data.replace('autofocus=""', 'autofocus="" value="' + html(q) + '"');
				res.write(data);
				res.end(yield fs.readFile('./html/a/foot.html', yield));
			}
		}));
	} else if (reqPath === '/host/' && !usesIODomain) {
		yield respondPage('Start a game', req, res, yield, {});
		res.write((yield fs.readFile('./html/host.html', yield)));
		res.end(yield fs.readFile('./html/a/foot.html', yield));
	} else if (reqPath === '/login/google' && !usesIODomain) {
		// Redirect URI after attempted Google login
		const tryagain = '<a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=' + config.googleAuth.clientID + '&amp;response_type=code&amp;scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me&amp;redirect_uri=' + encodeURIComponent('http://' + req.headers.host) + '%2Flogin%2Fgoogle">Try again.</a>';
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
		const googleReq = https.request({
			hostname: 'www.googleapis.com',
			path: '/oauth2/v4/token',
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}, o(function* (googRes) {
			let data = '';
			googRes.on('data', (d) => {
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
			const apiReq = https.get({
				hostname: 'www.googleapis.com',
				path: '/plus/v1/people/me?access_token=' + encodeURIComponent(data.access_token),
			}, o(function* (apiRes) {
				let apiData = '';
				apiRes.on('data', (d) => {
					apiData += d;
				});
				yield apiRes.on('end', yield);
				try {
					apiData = JSON.parse(apiData);
				} catch (e) {
					yield respondPage('Login Error', req, res, yield, {}, 500);
					res.write('<h1>Login Error</h1>');
					res.write('<p>An invalid response was received from the Google API. ' + tryagain + '</p>');
					res.end(yield fs.readFile('html/a/foot.html', yield));
				}
				if (apiData.error) {
					yield respondPage('Login Error', req, res, yield, {}, 500);
					res.write('<h1>Login Error</h1>');
					res.write('<p>An error was received from the Google API. ' + tryagain + '</p>');
					res.write(errorsHTML([apiData.error.message]));
					return res.end(yield fs.readFile('html/a/foot.html', yield));
				}

				// Store the user in the database and create a unique token
				const decodedToken = jwt.decode(data.id_token);
				const matchedUser = yield dbcs.users.findOne({ googleID: decodedToken.sub }, yield);
				const idToken = crypto.randomBytes(128).toString('base64');
				if (matchedUser) {
					dbcs.users.update({ googleID: decodedToken.sub }, {
						$push: {
							cookie: { token: idToken, created: new Date().getTime() },
						},
						$set: { personalInfo: apiData },
					});
				} else {
					dbcs.users.insert({
						_id: generateID(),
						cookie: [{ token: idToken, created: new Date().getTime() }],
						googleID: decodedToken.sub,
						personalInfo: apiData,
					});
				}

				// Finally, redirect to the console if login succeeds
				res.writeHead(303, {
					Location: '/console/',
					'Set-Cookie': cookie.serialize('id', idToken, {
						path: '/',
						expires: new Date(new Date().setDate(new Date().getDate() + 30)),
						httpOnly: true,
						secure: config.secureCookies,
					}),
				});
				res.end();
			}));
			apiReq.on('error', o(function* (e) {
				yield respondPage('Login Error', req, res, yield, {}, 500);
				res.write('<h1>Login Error</h1>');
				res.write('<p>HTTP error when connecting to the Google API: ' + e + ' ' + tryagain + '</p>');
				res.end(yield fs.readFile('html/a/foot.html', yield));
			}));
		}));
		googleReq.end('client_id=' + config.googleAuth.clientID + '&client_secret=' + config.googleAuth.clientSecret + '&code=' + encodeURIComponent(req.url.query.code) + '&redirect_uri=' + encodeURIComponent('http://' + req.headers.host + '/login/google') + '&grant_type=authorization_code');
		googleReq.on('error', o(function* (e) {
			yield respondPage('Login Error', req, res, yield, {}, 500);
			res.write('<h1>Login Error</h1>');
			res.write('<p>HTTP error when connecting to Google: ' + e + ' ' + tryagain + '</p>');
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (reqPath === '/stats/' && !usesIODomain) {
		// Rudimentary statistics
		if (!user || !user.admin) return errorNotFound(req, res);
		yield respondPage('Statistics', req, res, yield, {}, 400);
		dbcs.gameplays.aggregate({ $match: {} }, { $group: { _id: 'stats', num: { $sum: 1 }, sum: { $sum: '$participants' } } }, o(function* (err, result) {
			if (err) throw err;
			res.write('<h1>Aquaforces play statistics</h1>');
			res.write(`'<p>'${result[0].sum}' users</p>'`);
			res.write(`'<p>'${result[0].num}' gameplays</p>'`);
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (reqPath === '/status/') {
		// A status page to make sure Aquaforces is running
		yield respondPage('Status', req, res, yield);
		res.write('<h1>Aquaforces Status</h1>');
		const child = spawn('git', ['rev-parse', '--short', 'HEAD']);
		res.write('<p class="green"><strong>Running</strong>, commit #');
		child.stdout.on('data', (data) => {
			res.write(data);
		});
		child.stdout.on('end', o(function* () {
			res.write('</p>');
			if (user.name) res.write('<p>You are logged in.</strong></p>');
			else res.write('<p>You are not logged in</p>');
			res.write(`<p>Current host header is <strong>'${req.headers.host}'</strong></p>`);
			res.write('<code class="blk" id="socket-test">Connecting to socket…</code>');
			res.write(yield addVersionNonces('<script src="/a/sockettest.js"></script>', reqPath, yield));
			res.end(yield fs.readFile('html/a/foot.html', yield));
		}));
	} else if (redirectURLs.includes(reqPath) && !usesIODomain) {
		// Redirect URLs without a trailing slash
		res.writeHead(303, { Location: reqPath + '/' });
		res.end();
	} else return errorNotFound(req, res);
});

// MARK: actually start the server
console.log('Connecting to mongodb…'.cyan);
mongo.connect(config.mongoPath, (err, db) => {
	if (err) throw err;

	db.createCollection('qsets', (err, collection) => {
		if (err) throw err;
		db.createIndex('qsets', { title: 'text' }, {}, () => {});
		dbcs.qsets = collection;
	});

	let i = usedDBCs.length;

	function handleCollection(err, collection) {
		if (err) throw err;
		dbcs[usedDBCs[i]] = collection;
	}

	// Go through the mongodb data and store it server-side
	while (i--) db.collection(usedDBCs[i], handleCollection);
	console.log('Connected to mongodb.'.cyan);
	const server = http.createServer().listen(config.port);
	server.on('request', app);
	console.log('Aquaforces running on port 3000 over plain HTTP.'.cyan);

	/* eslint-disable global-require */
	require('./sockets/index')(server);
	/* eslint-enable global-require */
	console.log('Sockets running on port 3000 over plain WS.'.cyan);

	// Rudimentary tests
	if (process.argv.indexOf('--test') >= 0) {
		console.log('Running test, process will terminate when finished.'.yellow);
		http.get({
			port: config.port,
			headers: { host: 'localhost' },
		}, (testRes) => {
			testRes.on('data', () => {
				console.log('Data received'.grey);
			});
			testRes.on('end', () => {
				console.log('HTTP test passed, starting socket test.'.green);
				const wsc = new WS(`ws://localhost:${config.port}/test`);
				wsc.on('open', () => {
					console.log('Connected to socket.');
				});
				wsc.on('data', () => {
					console.log('Data received'.grey);
				});
				wsc.on('close', () => {
					console.log('Things seem to work!'.green);
					process.exit();
				});
			});
		});
	}
});
