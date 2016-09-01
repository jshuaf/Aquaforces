/* global dbcs:true */

const fs = require('fs');
const responses = {};
fs.readdirSync('./api').filter(file => file !== 'index.js').forEach((path) => {
	/* eslint-disable global-require */
	responses[path.substr(0, path.length - 3)] = require(`./${path}`);
	/* eslint-enable global-require */
});

module.exports = function (req, res) {
	res.badRequest = (message) => {
		res.writeHead(400);
		return res.end(message);
	};
	if (req.params.path === 'authenticate') {
		res.send(req.user ? JSON.stringify(req.user.personalInfo) : '');
	} else if (Object.keys(responses).indexOf(req.params.path) >= 0) {
		responses[req.params.path](req, res);
	} else {
		res.writeHead(404);
		return res.end('Error: The API feature requested has not been implemented.');
	}
};

