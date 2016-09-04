/* global dbcs: true */

const quizlet = require('./helpers/quizlet');
const logger = require('../logger');
const Joi = require('joi');
const helpers = require('../helpers');
const createSet = require('./create-qset');

module.exports = function (req, res) {
	const schema = {
		title: Joi.string(),
		source: Joi.object().keys({
			name: Joi.string().valid(['quizlet']),
			id: Joi.number(),
		}),
		questions: Joi.array().items(Joi.valid(null)),
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
	if (req.body.source.name === 'quizlet') {
		const qset = quizlet.parseSet(req.body);
		req.body = qset;
		return createSet(req, res);
	}
};
