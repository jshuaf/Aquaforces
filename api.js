'use strict';
const cookie = require('cookie');
module.exports = function(req, res, post) {
	if (req.url.pathname == '/new-qset') {
		if (!post.name) return res.writeHead(400) || res.end('Set name is required.');
		if (typeof post.name != 'string') return res.writeHead(400) || res.end('Set name must be a string.');
		if (post.name.length > 144) return res.writeHead(400) || res.end('Set name length must not be greater than 144 characters.');
		let uquestions;
		try {
			uquestions = JSON.parse(post.questions);
		} catch (e) {
			res.writeHead(400);
			res.end('Invalid JSON in questions.');
		}
		if (!(uquestions instanceof Array)) return res.writeHead(400) || res.end('Questions must be an array.');
		let questions = [];
		for (let i = 0; i < uquestions.length; i++) {
			let q = uquestions[i];
			if (!q.text || !q.answers || !q.incorrectAnswers) return res.writeHead(400) || res.end('Question ' + i + ' is malformed.');
			if (!(q.answers instanceof Array)) return res.writeHead(400) || res.end('Correct answers must be an array.');
			if (!(q.incorrectAnswers instanceof Array)) return res.writeHead(400) || res.end('Incorrect answers must be an array.');
			if (q.text.length > 144) return res.writeHead(400) || res.end('Question ' + i + ' is too long.');
			if (!q.answers.length) return res.writeHead(400) || res.end('Question ' + i + ' has no correct answers.');
			for (let j = 0; j < q.answers.length; j++) {
				if (typeof q.answers[j] != 'string') return res.writeHead(400) || res.end('Correct answer ' + j + ' of question ' + i + ' is malformed.');
				if (q.answers[j].length > 64) return res.writeHead(400) || res.end('Correct answer ' + j + ' of question ' + i + ' is too long.');
			}
			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] != 'string') return res.writeHead(400) || res.end('Incorrect answer ' + j + ' of question ' + i + ' is malformed.');
				if (q.incorrectAnswers[j].length > 64) return res.writeHead(400) || res.end('Incorrect answer ' + j + ' of question ' + i + ' is too long.');
			}
			questions.push({
				text: q.text,
				answers: q.answers,
				incorrectAnswers: q.incorrectAnswers
			});
		}
		const qsetID = generateID();
		const userID = cookie.parse(req.headers.cookie).userID;
		dbcs.qsets.insert({
			_id: qsetID,
			title: post.name,
			questions,
			timeAdded: new Date().getTime(),
			author: userID
		});
		dbcs.users.update(
			{_id: userID},
			{$push: {qsets: qsetID}}
		);
		res.end(qsetID);
	} else if (req.url.pathname == '/edit-question') {
		dbcs.qsets.findOne({_id: post.id}, function(err, qset) {
			if (err) throw err;
			if (!qset) return res.writeHead(400) || res.end('Error: Question set not found.');
			if (!(post.num < qset.questions.length)) return res.writeHead(400) || res.end('Error: Invalid question number.');
			let q;
			try {
				q = JSON.parse(post.question);
			} catch (e) {
				res.writeHead(400);
				res.end('Invalid JSON in questions.');
			}
			if (!q.text || !q.answers || !q.incorrectAnswers) return res.writeHead(400) || res.end('Question is malformed.');
			if (!(q.answers instanceof Array)) return res.writeHead(400) || res.end('Correct answers must be an array.');
			if (!(q.incorrectAnswers instanceof Array)) return res.writeHead(400) || res.end('Incorrect answers must be an array.');
			if (q.text.length > 144) return res.writeHead(400) || res.end('Question is too long.');
			if (!q.answers.length) return res.writeHead(400) || res.end('Question has no correct answers.');
			for (let j = 0; j < q.answers.length; j++) {
				if (typeof q.answers[j] != 'string') return res.writeHead(400) || res.end('Correct answer ' + j + ' is malformed.');
				if (q.answers[j].length > 64) return res.writeHead(400) || res.end('Correct answer ' + j + ' is too long.');
			}
			for (let j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] != 'string') return res.writeHead(400) || res.end('Incorrect answer ' + j + ' is malformed.');
				if (q.incorrectAnswers[j].length > 64) return res.writeHead(400) || res.end('Incorrect answer ' + j + ' is too long.');
			}
			qset.questions[post.num] = {
				text: q.text,
				answers: q.answers,
				incorrectAnswers: q.incorrectAnswers
			};
			dbcs.qsets.update({_id: post.id}, {$set: {questions: qset.questions}});
			res.end();
		});
	} else if (req.url.pathname == '/login') {
		const userID = cookie.parse(req.headers.cookie).userID;
		const existingUser = dbcs.users.find({userID});
		if (!existingUser) {
			dbcs.users.insert({
				_id: userID,
				qsets: []
			});
		}
		res.end();
	} else res.writeHead(404) || res.end('Error: The API feature requested has not been implemented.');
};