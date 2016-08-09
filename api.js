/* global generateID:true dbcs:true config:true*/

const cookie = require('cookie');
module.exports = function (req, res, post, user) {
	res.badRequest = (message) => {
		res.writeHead(400);
		return res.end(message);
	};

	if (req.url.pathname === '/logout') {
		res.writeHead(303, {
			'Set-Cookie': cookie.serialize('id', '', {
				path: '/',
				expires: new Date(new Date().setDate(new Date().getDate() - 30)),
				httpOnly: true,
				secure: config.secureCookies,
			}),
		});
		if (user) dbcs.users.update({ _id: user._id }, { $set: { cookie: [] } });
		res.end();
	} else if (req.url.pathname === '/new-qset') {
		if (!post.name) {
			return res.badRequest('Error: Set name is required.');
		} else if (post.name.length > 144) {
			return res.badRequest('Error: Set name length must not be greater than 144 characters.');
		}
		if (!user && post.public !== 1) {
			return res.badRequest('Error: Sets made by users who are not logged in must be public.');
		}
		dbcs.qsets.findOne({ title: post.name }, function (err, existingQSet) {
			if (err) throw err;
			if (existingQSet) {
				return res.badRequest('Error: A set with this name already exists.');
			}
			let uquestions;
			try {
				uquestions = JSON.parse(post.questions);
			} catch (e) {
				res.badRequest('Invalid JSON in questions.');
			}
			if (!(uquestions instanceof Array)) {
				return res.badRequest('Error: Questions must be an array.');
			}
			const questions = [];
			for (let i = 0; i < uquestions.length; i++) {
				const q = uquestions[i];
				if (!q.text || !q.answers || !q.incorrectAnswers) {
					return res.badRequest('Error: Question ' + i + ' is malformed.');
				} else if (!(q.answers instanceof Array)) {
					return res.badRequest('Error: Correct answers must be an array.');
				} else if (!(q.incorrectAnswers instanceof Array)) {
					return res.badRequest('Error: Incorrect answers must be an array.');
				} else if (q.text.length > 144) {
					return res.badRequest('Error: Question ' + i + ' is too long.');
				} else if (!q.answers.length) {
					return res.badRequest('Error: Question ' + i + ' has no correct answers.');
				}
				for (let j = 0; j < q.answers.length; j++) {
					if (typeof q.answers[j] !== 'string') {
						return res.badRequest('Error: Correct answer ' + j + ' of question ' + i + ' is malformed.');
					} else if (q.answers[j].length > 64) {
						return res.badRequest('Error: Correct answer ' + j + ' of question ' + i + ' is too long.');
					}
				}
				for (let j = 0; j < q.incorrectAnswers.length; j++) {
					if (typeof q.incorrectAnswers[j] !== 'string') {
						return res.badRequest('Error: Incorrect answer ' + j + ' of question ' + i + ' is malformed.');
					} else if (q.incorrectAnswers[j].length > 64) {
						return res.badRequest('Error: Incorrect answer ' + j + ' of question ' + i + ' is too long.');
					}
				}
				questions.push({
					text: q.text,
					answers: q.answers,
					incorrectAnswers: q.incorrectAnswers,
				});
			}
			const question = {
				_id: generateID(),
				title: post.name,
				questions,
				timeAdded: new Date().getTime(),
				public: post.public === 1,
			};
			if (user) {
				question.userID = user._id;
				question.userName = user.name;
			}
			dbcs.qsets.insert(question);
			res.badRequest(question._id);
		});
	} else if (req.url.pathname === '/delete-qset') {
		dbcs.qsets.findOne({ _id: post.id }, function (err, qset) {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			} else if (!user.admin && qset.userID !== user._id) {
				return res.badRequest('Error: You may not delete question sets that aren\'t yours.');
			}
			dbcs.qsets.remove({ _id: post.id });
			res.writeHead(204);
			res.end();
		});
	} else if (req.url.pathname === '/edit-question') {
		dbcs.qsets.findOne({ _id: post.id }, function (err, qset) {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			}
			if (!user.admin && qset.userID !== user._id) {
				return res.badRequest('Error: You may not edit question sets that aren\'t yours.');
			}
			if (post.num !== 'new' && !qset.questions[parseInt(post.num, 10)]) {
				return res.badRequest('Error: Invalid question number.');
			}
			let q;
			try {
				q = JSON.parse(post.question);
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
					return res.badRequest('Error: Correct answer ' + j + ' is malformed.');
				} else if (q.answers[j].length > 64) {
					return res.badRequest('Error: Correct answer ' + j + ' is too long.');
				}
			}
			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] !== 'string') {
					return res.badRequest('Error: Incorrect answer ' + j + ' is malformed.');
				} else if (q.incorrectAnswers[j].length > 64) {
					return res.badRequest('Error: Incorrect answer ' + j + ' is too long.');
				}
			}
			const question = {
				text: q.text,
				answers: q.answers,
				incorrectAnswers: q.incorrectAnswers,
			};
			if (post.num === 'new') qset.questions.push(question);
			else qset.questions[parseInt(post.num, 10)] = question;
			dbcs.qsets.update({ _id: post.id }, { $set: { questions: qset.questions } });
			res.writeHead(204);
			res.end();
		});
	} else if (req.url.pathname === '/remove-question') {
		dbcs.qsets.findOne({ _id: post.id }, (err, qset) => {
			if (err) throw err;
			if (!qset) {
				return res.badRequest('Error: Question set not found.');
			}
			if (!user.admin && qset.userID !== user._id) {
				return res.badRequest('Error: You may not edit question sets that aren\'t yours.');
			} else if (!qset.questions[parseInt(post.num, 10)]) {
				return res.badRequest('Error: Invalid question number.');
			}
			console.log(qset.questions.length);
			if (!qset.questions.length === 1) {
				return res.badRequest('Error: You may not remove the only question in a set.');
			}
			qset.questions.splice(parseInt(post.num, 10), 1);
			dbcs.qsets.update({ _id: post.id }, { $set: { questions: qset.questions } });
			res.writeHead(204);
			res.end();
		});
	} else {
		res.writeHead(404);
		return res.end('Error: The API feature requested has not been implemented.');
	}
};
