/* global dbcs: true */

const logger = require('../logger');

module.exports = function (req, res) {
	if (!req.body.shortID || typeof req.body.shortID !== 'string') {
		res.badRequest('Must send the short ID of a set to request.');
	}
	dbcs.qsets.findOne({ shortID: req.body.shortID }).then((qset) => {
		if (!qset) {
			return res.badRequest('Question set not found.');
		} else if (req.user) {
			if (!(qset.userID === req.user._id || !qset.privacy)) {
				return res.badRequest('You don\'t have permission to view this set.');
			}
		}
		res.success(JSON.stringify(qset));
	}, () => {
		res.badRequest('Could not find the question set requested.');
	}).catch((error) => {
		logger.error('Database find operation failed', { error, req });
		res.badRequest('Question set not found.');
	});
};
