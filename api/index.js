/* global generateID:true dbcs:true config:true*/

module.exports = function (req, res) {
	res.badRequest = (message) => {
		res.writeHead(400);
		return res.end(message);
	};
	if (req.params.path === 'authenticate') {
		res.send(req.user ? JSON.stringify(req.user.personalInfo) : '');
	} else {
		/* eslint-disable global-require */
		require(`./${req.params.path}.js`)(req, res);
		/* eslint-enable global-require */
	}
	// res.writeHead(404);
	// return res.end('Error: The API feature requested has not been implemented.');
};

