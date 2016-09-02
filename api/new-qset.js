/* global dbcs: true */

const helpers = require('../helpers');
const logger = require('../logger');
const Joi = require('joi');

module.exports = function (req, res) {
	if (!req.user) return res.badRequest('Cannot create a set when not logged in');
	const schema = {
		title: Joi.string().max(80).required(),
		questions: Joi.array().items(Joi.object().keys({
			text: Joi.string().max(200).required(),
			correctAnswer: Joi.string().max(160).required(),
			incorrectAnswers: Joi.array().items(Joi.object().keys({
				text: Joi.string().max(200).required(),
				id: Joi.number().required(),
			})).min(1).unique((a, b) => a.text === b.text)
			.not(Joi.ref('correctAnswer'))
			.required(),
			id: Joi.number().required(),
			nextAnswerID: Joi.number(),
		})).min(10).required(),
		privacy: Joi.boolean().required(),
		nextQuestionID: Joi.number(),
	};
	Joi.validate(req.body, schema, (error) => {
		if (error) {
			logger.error(error.details[0].message, error);
			return res.badRequest('Error: Set not valid.');
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
		res.end(res.writeHead(204));
	});
};
