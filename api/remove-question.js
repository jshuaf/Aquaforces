/* global dbcs: true */

module.exports = function (req, res) {
	dbcs.qsets.findOne({ _id: req.body.id }, (err, qset) => {
		if (err) throw err;
		if (!qset) {
			return res.badRequest('Error: Question set not found.');
		}
		if (!req.user.admin && qset.userID !== req.user._id) {
			return res.badRequest('Error: You may not edit question sets that aren\'t yours.');
		} else if (!qset.questions[parseInt(req.body.num, 10)]) {
			return res.badRequest('Error: Invalid question number.');
		}
		if (!qset.questions.length === 1) {
			return res.badRequest('Error: You may not remove the only question in a set.');
		}
		qset.questions.splice(parseInt(req.body.num, 10), 1);
		dbcs.qsets.update({ _id: req.body.id }, { $set: { questions: qset.questions } });
		res.success();
	});
};
