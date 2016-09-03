// NOTE: This is old code. Editing functionality has not been implemented yet.

/* global dbcs: true */

module.exports = function (req, res) {
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
};
