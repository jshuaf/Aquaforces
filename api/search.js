/* global dbcs: true */

const request = require('request');
const co = require('co');
const config = require('../config');
const logger = require('../logger');
const quizlet = require('./helpers/quizlet');
const Joi = require('joi');

module.exports = function (req, res) {
	if (!req.body.query) {
		return res.badRequest('No search query provided.');
	} else if (!req.body.filter) {
		return res.badRequest('No search filter provided.');
	}

	const schema = {
		sources: Joi.array().items(Joi.valid('quizlet', 'aquaforces')),
	};
	const validation = Joi.validate(req.body.filter, schema, { presence: 'required' });
	if (validation.error) {
		logger.error('Requested search filter doesn\'t match schema.', validation.error);
		return res.badRequest('Error: Search filter not valid.');
	}

	let qsets = [];

	// Database Search
	if (req.body.filter.sources.indexOf('aquaforces') >= 0) {
		const searchFilter = { $text: { $search: req.body.query } };
		const privacyFilter = { $or: [{ privacy: false }] };
		if (req.user) privacyFilter.$or.push({ userID: req.user._id });
		const filter = Object.assign(searchFilter, privacyFilter);
		dbcs.qsets.find(filter).each((err, qset) => {
			if (qset) {
				qsets.push(qset);
			}
		});
	}

	// Quizlet Search
	if (req.body.filter.sources.indexOf('quizlet') >= 0) {
		const url = `https://api.quizlet.com/2.0/search/sets?q=${req.body.query}&client_id=${config.quizlet.clientID}`;
		request(url, (error, _, body) => {
			if (error) {
				logger.error('Error when searching Quizlet for set query', { error, query: req.body.query });
				res.writeHead(200);
				return res.end(JSON.stringify(qsets));
			}
			const quizletSearchResults = JSON.parse(body);
			const parsedSets = quizletSearchResults.sets.map((set) => quizlet.getSet(set.id));
			co(function* () {
				return yield parsedSets;
			}).then((sets) => {
				qsets = qsets.concat(sets.filter(s => s !== '').map(quizlet.parseSet));
				return res.success(qsets);
			});
		});
	} else {
		return res.success(qsets);
	}
};
