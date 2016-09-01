/* global dbcs: true */

const helpers = require('../helpers');

module.exports = function (req, res) {
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

	const questionSet = Object.assign(req.body, {
		_id: helpers.generateID(),
		timeAdded: new Date().getTime(),
		shortID: (`${Math.random().toString(36)}00000000000000000`).slice(2, 9),
	});

	if (req.user) {
		questionSet.userID = req.user._id;
		questionSet.userName = req.user.name;
	}

	dbcs.qsets.insert(questionSet);
	console.log(questionSet);
	res.end(res.writeHead(204));
};
