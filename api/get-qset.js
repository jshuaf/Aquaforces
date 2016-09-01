/* global dbcs: true */

module.exports = function (req, res) {
	if (!req.body.shortID || typeof req.body.shortID !== 'string') {
		res.badRequest('Must send the short ID of a set to request.');
	}
	dbcs.qsets.findOne({ shortID: req.body.shortID }).then((qset) => {
		if (!qset) {
			return res.badRequest('Question set not found.');
		} else if (!(qset.userID === req.user._id || !qset.privacy)) {
			return res.badRequest('You don\'t have permission to view this set.');
		}
		res.writeHead(200);
		res.end(JSON.stringify(qset));
	}, () => {
		res.badRequest('Could not find the question set requested.');
	});
};
