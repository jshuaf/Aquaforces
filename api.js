'use strict';
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
		for (var i = 0; i < uquestions.length; i++) {
			var q = uquestions[i];
			if (!q.text || !q.answer || !q.incorrectAnswers) res.writeHead(400) || res.end('Question ' + i + ' is malformed.');
			if (q.text.length > 144) res.writeHead(400) || res.end('Question ' + i + ' is too long.');
			if (q.answer.length > 64) res.writeHead(400) || res.end('The correct answer of question ' + i + ' is too long.');
			for (var j = 0; j < q.incorrectAnswers.length; j++) {
				if (typeof q.incorrectAnswers[j] != 'string') res.writeHead(400) || res.end('Incorrect answer ' + j + ' of question ' + i + ' is malformed.');
				if (q.incorrectAnswers[j].length > 64) res.writeHead(400) || res.end('Incorrect answer ' + j + ' of question ' + i + ' is too long.');
			}
			questions.push({
				text: q.text,
				answer: q.answer,
				incorrectAnswers: q.incorrectAnswers
			});
		}
		dbcs.qsets.insert({
			_id: generateID(),
			title: post.name,
			questions,
			timeAdded: new Date().getTime()
		});
		res.writeHead(204);
		res.end();
	} else {
		res.writeHead(404);
		res.end('The API feature requested has not been implemented.');
	}
};