/* global dbcs: true */

module.exports = function (req, res) {
	dbcs.qsets.findOne({ _id: req.body.id }, (err, qset) => {
		if (err) throw err;
		if (!qset) {
			return res.badRequest('Error: Question set not found.');
		} else if (req.user && !req.user.admin && qset.userID !== req.user._id) {
			return res.badRequest('Error: You may not delete question sets that aren\'t yours.');
		}
		dbcs.qsets.remove({ _id: req.body.id });
		res.end(res.writeHead(204));
	});
};
