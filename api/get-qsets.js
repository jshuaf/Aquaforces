module.exports = function(req, res) {
	const qsets = [];
	const ownSetsFilter = { $or: [{ privacy: false }] };
	if (req.user) ownSetsFilter.$or.push({ userID: req.user._id });
	dbcs.qsets.find(ownSetsFilter).each((err, qset) => {
		if (qset) qsets.push(qset);
		else {
			res.header('Content-Type', 'application/json');
			res.writeHead(200);
			return res.end(JSON.stringify(qsets));
		}
}