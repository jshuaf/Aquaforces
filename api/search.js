/* global dbcs: true */

const request = require('request');
const co = require('co');
const config = require('../config');
const logger = require('../logger');
const quizlet = require('./helpers/quizlet');

module.exports = function (req, res) {
	if (!req.body.query) {
		return res.badRequest('No search query provided.');
	}

	// Database Search
	const searchFilter = { $search: req.body.query };
	const privacyFilter = { $or: [{ privacy: false }] };
	let qsets = [];
	if (req.user) privacyFilter.$or.push({ userID: req.user._id });
	dbcs.qsets.find(searchFilter, privacyFilter).each((err, qset) => {
		if (qset) {
			qsets.push(qset);
		}
	});

	// Quizlet Search
	const url = `https://api.quizlet.com/2.0/search/sets?q=${req.body.query}&client_id=${config.quizlet.clientID}`;
	request(url, (error, _, body) => {
		if (error) {
			logger.error('Error when searching Quizlet for set query', { error, query: req.body.query });
			res.writeHead(200);
			return res.end(JSON.stringify(qsets));
		}
		const quizletSearchResults = JSON.parse(body);
		const parsedSets = quizletSearchResults.sets.map((set) => quizlet.parseSet(set.id));
		co(function* () {
			return yield parsedSets;
		}).then((sets) => {
			qsets = qsets.concat(sets.filter(s => s !== ''));
			return res.success(qsets);
		});
	});
};
