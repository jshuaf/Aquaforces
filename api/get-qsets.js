/* global dbcs: true */

module.exports = function (req, res) {
	const qsets = [];
	const ownSetsFilter = { $or: [{ privacy: false }] };
	if (req.user) ownSetsFilter.$or.push({ userID: req.user._id });
	dbcs.qsets.find(ownSetsFilter).each((err, qset) => {
		if (qset) qsets.push(qset);
		else {
			return res.success(qsets);
		}
	});
};
