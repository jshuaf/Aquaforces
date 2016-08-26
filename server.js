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
	fs = require('fs'),
	cookie = require('cookie'),
	crypto = require('crypto'),
	mongo = require('mongodb').MongoClient,
	WS = require('ws'),
	o = require('yield-yield'),
	jwt = require('jsonwebtoken'),
	express = require('express'),
	request = require('request'),
	bodyParser = require('body-parser');
	/* eslint-enable one-var */

// Server Middleware
const initialMiddleware = {
	getUser: o(function* (req, res, next) {
		// Get the current logged-in user
		req.user = yield dbcs.users.findOne({
			cookie: { $elemMatch: {
				token: cookie.parse(req.headers.cookie || '').id || 'nomatch',
				created: { $gt: new Date() - 2592000000 },
			} },
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
	redirectIO: (req, res, next) => {
		const includesIO = req.get('host').includes('.io');
		if (!includesIO || req.path.includes('/play')) return next();
		res.redirect(302, `aquaforces.com${req.path}`);
		next();
	},
};

const head = (req, res, next) => {
	res.locals.head = fs.readFileSync('./html/a/head.html').toString()
		.replaceAll('$inhead', res.locals.inHead || '')
		.replaceAll('$title', res.locals.title || 'Aquaforces');
	next();
};

const app = express();
Object.keys(initialMiddleware).map((name) => app.use(initialMiddleware[name]));
app.use(express.static('http'));
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

app.get('/play', (req, res, next) => {
	if (req.get('host').includes('.io')) return res.redirect(301, 'aquaforces.io');
	res.locals.title = 'Join a game';
	next();
}, head, (req, res) => {
	const playPage = fs.readFileSync('./html/play.html').toString();
	res.send(res.locals.head + playPage + res.locals.foot);
});

app.get('/host', (req, res, next) => {
	res.locals.title = 'Start a game';
	next();
}, head, (req, res) => {
	const hostPage = fs.readFileSync('./html/host.html').toString();
	res.send(res.locals.head + hostPage + res.locals.foot);
});

app.post('/api/:path', (req, res) => apiServer(req, res));

app.get('/login/google', (req, res) => {
	if (req.query.error) return res.send(`<p>Error: ${req.query.error}</p>`);
	if (!req.query.code) return res.send('<p>Error: No code</p>');
	request({
		url: 'https://www.googleapis.com/oauth2/v4/token',
		method: 'post',
		form: {
			client_id: config.googleAuth.clientID,
			client_secret: config.googleAuth.clientSecret,
			code: req.query.code,
			redirect_uri: `http://${req.get('host')}/login/google`,
			grant_type: 'authorization_code',
		},
	}, (error, _, body) => {
		const tokenData = JSON.parse(body);
		if (error || tokenData.error) {
			error = error || tokenData.error;
			console.error(error);
			return res.send('<p>Error getting token.</p>');
		}
		request({
			url: 'https://www.googleapis.com/plus/v1/people/me',
			qs: { access_token: body.access_token },
		}, o(function* (error, _, body) {
			const apiData = JSON.parse(body);
			console.log(apiData, tokenData);
			if (error || apiData.error) {
				error = error || apiData.error.errors;
				console.error(error);
				return res.send('<p>Error accessing Google+ API.</p>');
			}
			const decodedToken = jwt.decode(tokenData.id_token);
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
			res.writeHead(303, {
				Location: '/console/',
				'Set-Cookie': cookie.serialize('id', idToken, {
					path: '/',
					expires: new Date(new Date().setDate(new Date().getDate() + 30)),
					httpOnly: true,
					secure: config.secureCookies,
				}),
			});
		})
		);
	});
});
/*
CONSOLE SEARCHING CODE FOR LATER
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
dbcs.qsets.find(
filter, searchText ? { score: {
$meta: 'textScore' } } : undefined).sort(
searchText ? { score: { $meta: 'textScore' } } : { timeAdded: -1 }).each(o(function* (err, qset) {
	if (err) throw err;

	// MARK: ugly html insertion, will later be replaced by React
	if (qset) {
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
*/


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
