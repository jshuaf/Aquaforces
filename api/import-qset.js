/* global dbcs: true */

const quizlet = require('./helpers/quizlet');
const logger = require('../logger');
const request = require('request');
const Joi = require('joi');

module.exports = function (req, res) {
	const schema = { name: Joi.string().valid(['quizlet']), id: Joi.string() };
	const validation = Joi.validate(req.body, schema, { presence: 'required' });
	if (validation.error) {
		logger.error('Requested set to import doesn\'t have correct source data', validation.error);
		return res.badRequest('Error: Could not import set.');
	}
	if (req.body.name === 'quizlet') {
		quizlet.getSet(req.body.id)
		.then((set) => {
			console.log(set);
		});
	}
};
