/* global dbcs: true */

const request = require('request');
const co = require('co');
const config = require('../config');
const logger = require('../logger');

function parseQuizletSet(quizletID) {
	const url = `https://api.quizlet.com/2.0/sets/${quizletID}?client_id=${config.quizlet.clientID}`;
	return new Promise((resolve) => {
		request({ url }, (error, res) => {
			if (error) {
				logger.error('Error when requesting set from Quizlet', { error, quizletID });
				return resolve(error);
			}
			const quizletSet = JSON.parse(res.body);
			if (!quizletSet.title) return resolve('');
			const qset = { title: quizletSet.title, questions: [], privacy: false };
			const answerPool = [];
			quizletSet.terms.forEach((term) => {
				if (term.definition.length > 0 && answerPool.indexOf(term.definition) < 0) {
					answerPool.push(term.definition);
				}
			});
			if (answerPool.length < 10) return resolve('');
			quizletSet.terms.forEach((term, index) => {
				const correctAnswer = term.definition;
				const incorrectAnswers = [];
				while (incorrectAnswers.length < 3) {
					const randomAnswer = answerPool[Math.floor(Math.random() * answerPool.length)];
					if (incorrectAnswers.indexOf(randomAnswer) < 0 && randomAnswer !== correctAnswer) {
						incorrectAnswers.push({ text: randomAnswer, id: incorrectAnswers.length });
					}
				}
				qset.questions.push({ text: term.term, correctAnswer, incorrectAnswers, id: index });
			});
			resolve(qset);
		});
	});
}

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
		const parsedSets = quizletSearchResults.sets.map((set) => parseQuizletSet(set.id));
		co(function* () {
			return yield parsedSets;
		}).then((sets) => {
			qsets = qsets.concat(sets.filter(s => s !== ''));
			return res.success(qsets);
		});
	});
};
