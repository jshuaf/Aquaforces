/* global dbcs: true */

const quizlet = require('./helpers/quizlet');
const logger = require('../logger');
const Joi = require('joi');
const helpers = require('../helpers');

module.exports = function (req, res) {
	const schema = {
		title: Joi.string(),
		source: Joi.object().keys({
			name: Joi.string().valid(['quizlet']),
			id: Joi.string(),
		}),
		questions: Joi.array().valid(null),
		answerPool: Joi.array().items(Joi.string()).min(10),
		terms: Joi.array().items(Joi.object().keys({
			id: Joi.number(),
			term: Joi.string(),
			definition: Joi.string(),
			image: Joi.any(),
			rank: Joi.number(),
		})),
	};
	const validation = Joi.validate(req.body, schema, { presence: 'required' });
	if (validation.error) {
		logger.error('Requested set to import doesn\'t have correct source data', validation.error);
		return res.badRequest('Error: Could not import set.');
	}
	if (req.body.name === 'quizlet') {
		const qset = quizlet.parseSet(req.body);
		const shortID = (`${Math.random().toString(36)}00000000000000000`).slice(2, 9);
		const questionSet = Object.assign({}, qset, {
			_id: helpers.generateID(),
			timeAdded: new Date().getTime(),
			shortID,
			userID: req.user._id,
			userName: req.user.personalInfo.displayName,
		});
		console.log(questionSet);
	}
};
