/* global generateID:true dbcs:true config:true*/
const request = require('request');

module.exports = function (req, res) {
	res.badRequest = (message) => {
		res.writeHead(400);
		return res.end(message);
	};
	if (req.params.path === 'authenticate') {
		res.send(req.user ? JSON.stringify(req.user.personalInfo) : '');
	} else if (req.params.path === 'new-qset') {
		if (!req.body.title) {
			return res.badRequest('Error: Set name is required.');
		} else if (req.body.title.length > 144) {
			return res.badRequest('Error: Set name length should be 144 characters or less.');
		} else if (!req.user && req.body.privacy === true) {
			return res.badRequest('Error: Sets made by users who are not logged in must be public.');
		}

		if (!(req.body.questions instanceof Array)) {
			return res.badRequest('Error: Questions must be an array.');
		}

		for (let i = 0; i < req.body.questions.length; i++) {
			const q = req.body.questions[i];
			if (!q.text || !q.correctAnswer || !q.incorrectAnswers) {
				return res.badRequest(`Error: Question ${i} must have text, a correct answer, and incorrect answers.`);
			} else if (!(typeof q.correctAnswer === 'string')) {
				return res.badRequest(`Error: Correct answer of question ${i} must be a string.`);
			} else if (!(q.incorrectAnswers instanceof Array)) {
				return res.badRequest(`Error: Incorrect answers in question ${i} must be an array.`);
			} else if (q.text.length > 144) {
				return res.badRequest(`Error: Question ${i} should be under 144 characters.`);
			} else if (q.correctAnswer.length > 64) {
				return res.badRequest(`Error: Correct answer of question ${i} should be under 64 characters.`);
			}

			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (!q.incorrectAnswers[j].text) {
					return res.badRequest(`Error: Incorrect answer ${j} of question {i} must have text.`);
				} else if (!(typeof q.incorrectAnswers[j].text === 'string')) {
					return res.badRequest(`Error: Incorrect answer ${j} of question ${i} must be a string.`);
				} else if (q.incorrectAnswers[j].length > 64) {
					return res.badRequest(
						`Error: Incorrect answer ${j} of question ${i} should be under 64 characters.`);
				}
			}
		}

		const questionSet = Object.assign({
			_id: generateID(),
			timeAdded: new Date().getTime(),
			shortID: (`${Math.random().toString(36)}00000000000000000`).slice(2, 9),
		}, req.body);

		if (req.user) {
			questionSet.userID = req.user._id;
			questionSet.userName = req.user.name;
		}

		dbcs.qsets.insert(questionSet);
		res.end(res.writeHead(204));
	} else if (req.params.path === 'get-qsets') {
		const qsets = [];
		const ownSetsFilter = { $or: [{ privacy: false }] };
		if (req.user) ownSetsFilter.$or.push({ userID: req.user._id });
		dbcs.qsets.find(ownSetsFilter).each((err, qset) => {
			if (qset) qsets.push(qset);
			else {
				res.header('Content-Type', 'application/json');
				res.writeHead(200);
				return res.end(JSON.stringify(qsets));
			}
		});
	} else if (req.params.path === 'get-qset') {
		if (!req.body.shortID || typeof req.body.shortID !== 'string') {
			res.badRequest('Must send the short ID of a set to request.');
		}
		dbcs.qsets.findOne({ shortID: req.body.shortID }).then((qset) => {
			if (!qset) {
				return res.badRequest('Question set not found.');
			} else if (!(qset.userID === req.user._id || !qset.privacy)) {
				return res.badRequest('You don\'t have permission to view this set.');
			}
			res.writeHead(200);
			res.end(JSON.stringify(qset));
		}, () => {
			res.badRequest('Could not find the question set requested.');
		});
	} else if (req.params.path === 'delete-qset') {
		dbcs.qsets.findOne({ _id: req.body.id }, (err, qset) => {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			} else if (req.user && !req.user.admin && qset.userID !== req.user._id) {
				return res.badRequest('Error: You may not delete question sets that aren\'t yours.');
			}
			dbcs.qsets.remove({ _id: req.body.id });
			res.end(res.writeHead(204));
		});
	} else if (req.params.path === 'edit-question') {
		dbcs.qsets.findOne({ _id: req.body.id }, (err, qset) => {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			} else if (!req.user.admin && qset.userID !== req.user._id) {
				return res.badRequest('Error: You may not edit question sets that aren\'t yours.');
			}
			if (req.body.num !== 'new' && !qset.questions[parseInt(req.body.num, 10)]) {
				return res.badRequest('Error: Invalid question number.');
			}
			let q;
			try {
				q = JSON.parse(req.body.question);
			} catch (e) {
				res.badRequest('Invalid JSON in questions.');
			}
			if (!q.text || !q.answers || !q.incorrectAnswers) {
				return res.badRequest('Error: Question is malformed.');
			} else if (!(q.answers instanceof Array)) {
				return res.badRequest('Error: Correct answers must be an array.');
			} else if (!(q.incorrectAnswers instanceof Array)) {
				return res.badRequest('Error: Incorrect answers must be an array.');
			} else if (q.text.length > 144) {
				return res.badRequest('Error: Question is too long.');
			} else if (!q.answers.length) {
				return res.badRequest('Error: Question has no correct answers.');
			}
			for (let j = 0; j < q.answers.length; j++) {
				if (typeof q.answers[j] !== 'string') {
					return res.badRequest(`Error: Correct answer ${j} is malformed.`);
				} else if (q.answers[j].length > 64) {
					return res.badRequest(`Error: Correct answer ${j} is too long.`);
				}
			}
			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] !== 'string') {
					return res.badRequest(`Error: Incorrect answer ${j} is malformed.`);
				} else if (q.incorrectAnswers[j].length > 64) {
					return res.badRequest(`Error: Incorrect answer ${j} is malformed.`);
				}
			}
			const question = {
				text: q.text,
				answers: q.answers,
				incorrectAnswers: q.incorrectAnswers,
			};
			if (req.body.num === 'new') qset.questions.push(question);
			else qset.questions[parseInt(req.body.num, 10)] = question;
			dbcs.qsets.update({ _id: req.body.id }, { $set: { questions: qset.questions } });
			res.writeHead(204);
			res.end();
		});
	} else if (req.params.path === 'remove-question') {
		dbcs.qsets.findOne({ _id: req.body.id }, (err, qset) => {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			}
			if (!req.user.admin && qset.userID !== req.user._id) {
				return res.badRequest('Error: You may not edit question sets that aren\'t yours.');
			} else if (!qset.questions[parseInt(req.body.num, 10)]) {
				return res.badRequest('Error: Invalid question number.');
			}
			if (!qset.questions.length === 1) {
				return res.badRequest('Error: You may not remove the only question in a set.');
			}
			qset.questions.splice(parseInt(req.body.num, 10), 1);
			dbcs.qsets.update({ _id: req.body.id }, { $set: { questions: qset.questions } });
			res.writeHead(204);
			res.end();
		});
	} else if (req.params.path === 'search') {
		if (!req.body.query) {
			return res.badRequest('No search query provided.');
		}

		// Database Search
		const searchFilter = { $search: req.body.query };
		const privacyFilter = { $or: [{ privacy: false }] };
		const qsets = [];
		if (req.user) privacyFilter.$or.push({ userID: req.user._id });
		dbcs.qsets.find(searchFilter, privacyFilter).each((err, qset) => {
			if (qset) {
				qsets.push(qset);
			}
		});

		// Quizlet Search
		const url = `https://api.quizlet.com/2.0/search/sets?q=${req.body.query}&client_id=${config.quizlet.clientID}`;
		request({ url }, (error, _, body) => {
			console.log(body);
			res.header('Content-Type', 'application/json');
			res.writeHead(200);
			return res.end(JSON.stringify(qsets));
		});
	} else {
		res.writeHead(404);
		return res.end('Error: The API feature requested has not been implemented.');
	}
};

