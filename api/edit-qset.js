/* global dbcs: true */

const helpers = require('../helpers');
const logger = require('../logger');
const Joi = require('joi');

module.exports = function (req, res) {
	if (!req.user) return res.badRequest('Cannot create a set when not logged in');

	// Check basic types and sizes
	const schema = {
		_id: Joi.string(),
		shortID: Joi.string(),
		title: Joi.string().max(80),
		questions: Joi.array().items(Joi.object().keys({
			text: Joi.string().max(200),
			correctAnswer: Joi.string().max(160),
			incorrectAnswers: Joi.array().items(Joi.object().keys({
				text: Joi.string().max(200),
				id: Joi.number(),
			})).min(1),
			id: Joi.number(),
			nextAnswerID: Joi.number(),
		})).min(1),
		privacy: Joi.boolean(),
		nextQuestionID: Joi.number(),
		timeAdded: Joi.date().max(Date.now()),
		userID: Joi.string(),
		userName: Joi.string(),
		source: Joi.object().keys({
			name: Joi.string(),
			id: Joi.number(),
		}).optional(),
	};
	const validation = Joi.validate(req.body, schema, { presence: 'required' });
	if (validation.error) {
		logger.error('Requested set to create doesn\'t match schema.', validation.error);
		return res.badRequest('Error: Set not valid.');
	}

	// Check for answer duplicates
	for (let i = 0; i < req.body.questions.length; i++) {
		const question = req.body.questions[i];
		try {
			Joi.assert(question.incorrectAnswers, Joi.array().unique((a, b) => a.text === b.text));
			const invalids = question.incorrectAnswers.map(a => a.text);
			Joi.assert(question.correctAnswer, Joi.string().invalid(invalids));
		} catch (error) {
			logger.error('New set answer combination contains duplicates.', error);
			return res.badRequest('Error: Set not valid.');
		}
	}

	dbcs.qsets.update({ _id: req.body._id }, req.body).then(() => {
		res.success({ shortID: req.body.shortID });
	}).catch((error) => {
		logger.error('Database update operation failed', { error, body: req.body });
		res.badRequest('Question set not found.');
	});
};
