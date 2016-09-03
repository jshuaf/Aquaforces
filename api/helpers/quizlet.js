const request = require('request');
const logger = require('../../logger');
const config = require('../../config');

module.exports = {
	getSet: (quizletID) => {
		const url = `https://api.quizlet.com/2.0/sets/${quizletID}?client_id=${config.quizlet.clientID}`;
		return new Promise((resolve) => {
			request({ url }, (error, res) => {
				if (error) {
					logger.error('Error when requesting set from Quizlet', { error, quizletID });
					return resolve(error);
				}
				const quizletSet = JSON.parse(res.body);
				if (!quizletSet.title) return resolve('');
				const qset = {
					title: quizletSet.title,
					source: { name: 'quizlet', id: quizletID },
				};
				const answerPool = [];
				quizletSet.terms.forEach((term) => {
					if (term.definition.length > 0 && answerPool.indexOf(term.definition) < 0) {
						answerPool.push(term.definition);
					}
				});
				if (answerPool.length < 10) return resolve('');
				qset.questions = Array(quizletSet.term_count);
				qset.answerPool = answerPool;
				qset.terms = quizletSet.terms;
				resolve(qset);
			});
		});
	},
	parseSet: (qset) => {
		Object.assign(qset, {
			privacy: false,
			questions: [],
		});
		qset.terms.forEach((term, index) => {
			const correctAnswer = term.definition;
			const incorrectAnswers = [];
			while (incorrectAnswers.length < 3) {
				const randomAnswer = qset.answerPool[Math.floor(Math.random() * qset.answerPool.length)];
				if (incorrectAnswers.indexOf(randomAnswer) < 0 && randomAnswer !== correctAnswer) {
					incorrectAnswers.push({ text: randomAnswer, id: incorrectAnswers.length });
				}
			}
			qset.questions.push({ text: term.term, correctAnswer, incorrectAnswers, id: index });
		});
		delete qset.answerPool;
		delete qset.terms;
		return qset;
	},
};
