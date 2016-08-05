'use strict';
const cookie = require('cookie');
module.exports = function(req, res, post, user) {
	if (req.url.pathname == '/logout') {
		res.writeHead(303, {
			'Set-Cookie': cookie.serialize('id', '', {
				path: '/',
				expires: new Date(new Date().setDate(new Date().getDate() - 30)),
				httpOnly: true,
				secure: config.secureCookies
			})
		});
		if (user) dbcs.users.update({_id: user._id}, {$set: {cookie: []}});
		res.end();
	} else if (req.url.pathname == '/new-qset') {
		if (!post.name) return res.writeHead(400) || res.end('Error: Set name is required.');
		if (post.name.length > 144) return res.writeHead(400) || res.end('Error: Set name length must not be greater than 144 characters.');
		if (!user && post.public != 1) return res.writeHead(400) || res.end('Error: Sets made by users who are not logged in must be public.');
		dbcs.qsets.findOne({title: post.name}, function(err, existingQSet) {
			if (err) throw err;
			if (existingQSet) return res.writeHead(400) || res.end('Error: A set with this name already exists.');
			let uquestions;
			try {
				uquestions = JSON.parse(post.questions);
			} catch (e) {
				res.writeHead(400);
				res.end('Invalid JSON in questions.');
			}
			if (!(uquestions instanceof Array)) return res.writeHead(400) || res.end('Error: Questions must be an array.');
			let questions = [];
			for (let i = 0; i < uquestions.length; i++) {
				let q = uquestions[i];
				if (!q.text || !q.answers || !q.incorrectAnswers) return res.writeHead(400) || res.end('Error: Question ' + i + ' is malformed.');
				if (!(q.answers instanceof Array)) return res.writeHead(400) || res.end('Error: Correct answers must be an array.');
				if (!(q.incorrectAnswers instanceof Array)) return res.writeHead(400) || res.end('Error: Incorrect answers must be an array.');
				if (q.text.length > 144) return res.writeHead(400) || res.end('Error: Question ' + i + ' is too long.');
				if (!q.answers.length) return res.writeHead(400) || res.end('Error: Question ' + i + ' has no correct answers.');
				for (let j = 0; j < q.answers.length; j++) {
					if (typeof q.answers[j] != 'string') return res.writeHead(400) || res.end('Error: Correct answer ' + j + ' of question ' + i + ' is malformed.');
					if (q.answers[j].length > 64) return res.writeHead(400) || res.end('Error: Correct answer ' + j + ' of question ' + i + ' is too long.');
				}
				for (let j = 0; j < q.incorrectAnswers.length; j++) {
					if (typeof q.incorrectAnswers[j] != 'string') return res.writeHead(400) || res.end('Error: Incorrect answer ' + j + ' of question ' + i + ' is malformed.');
					if (q.incorrectAnswers[j].length > 64) return res.writeHead(400) || res.end('Error: Incorrect answer ' + j + ' of question ' + i + ' is too long.');
				}
				questions.push({
					text: q.text,
					answers: q.answers,
					incorrectAnswers: q.incorrectAnswers
				});
			}
			let question = {
				_id: generateID(),
				title: post.name,
				questions,
				timeAdded: new Date().getTime(),
				public: post.public == 1
			};
			if (user) {
				question.userID = user._id;
				question.userName = user.name;
			}
			dbcs.qsets.insert(question);
			res.end(question._id);
		});
	} else if (req.url.pathname == '/edit-question') {
		dbcs.qsets.findOne({_id: post.id}, function(err, qset) {
			if (err) throw err;
			if (!qset) return res.writeHead(400) || res.end('Error: Question set not found.');
			if (qset.userID != user._id) return res.writeHead(400) || res.end('Error: You may not edit question sets that aren\'t yours.');
			if (post.num != 'new' && !qset.questions[parseInt(post.num)]) return res.writeHead(400) || res.end('Error: Invalid question number.');
			let q;
			try {
				q = JSON.parse(post.question);
			} catch (e) {
				res.writeHead(400);
				res.end('Invalid JSON in questions.');
			}
			if (!q.text || !q.answers || !q.incorrectAnswers) return res.writeHead(400) || res.end('Error: Question is malformed.');
			if (!(q.answers instanceof Array)) return res.writeHead(400) || res.end('Error: Correct answers must be an array.');
			if (!(q.incorrectAnswers instanceof Array)) return res.writeHead(400) || res.end('Error: Incorrect answers must be an array.');
			if (q.text.length > 144) return res.writeHead(400) || res.end('Error: Question is too long.');
			if (!q.answers.length) return res.writeHead(400) || res.end('Error: Question has no correct answers.');
			for (let j = 0; j < q.answers.length; j++) {
				if (typeof q.answers[j] != 'string') return res.writeHead(400) || res.end('Error: Correct answer ' + j + ' is malformed.');
				if (q.answers[j].length > 64) return res.writeHead(400) || res.end('Error: Correct answer ' + j + ' is too long.');
			}
			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] != 'string') return res.writeHead(400) || res.end('Error: Incorrect answer ' + j + ' is malformed.');
				if (q.incorrectAnswers[j].length > 64) return res.writeHead(400) || res.end('Error: Incorrect answer ' + j + ' is too long.');
			}
			let question = {
				text: q.text,
				answers: q.answers,
				incorrectAnswers: q.incorrectAnswers
			};
			if (post.num == 'new') qset.questions.push(question);
			else qset.questions[parseInt(post.num)] = question;
			dbcs.qsets.update({_id: post.id}, {$set: {questions: qset.questions}});
			res.writeHead(204);
			res.end();
		});
	} else res.writeHead(404) || res.end('Error: The API feature requested has not been implemented.');
};