const fs = require('fs');
const logger = require('../logger');

const responses = {};

fs.readdirSync('./api').filter(
	file => file !== 'index.js' && file.substr(file.length - 2, file.length) === 'js').forEach((path) => {
	/* eslint-disable global-require */
		responses[path.substr(0, path.length - 3)] = require(`./${path}`);
	/* eslint-enable global-require */
	});

module.exports = function (req, res) {
	res.badRequest = (message) => {
		logger.warn('API request was rejected',
		{ message, userID: req.user ? req.user._id : null, path: req.params.path, body: req.body });
		res.writeHead(400);
		return res.end(message);
	};
	res.success = (data) => {
		logger.info('API request succeeded', { data, body: req.body, path: req.params.path });
		res.header('Content-Type', 'application/json');
		if (data) return res.send(data);
		return res.end();
	};
	res.forbidden = () => {
		logger.warn('API request forbidden',
		{ userID: req.user ? req.user._id : null, path: req.params.path, body: req.body });
		res.writeHead(404);
		return res.end();
	};
	logger.info('Recieved API request', { body: req.body, path: req.params.path });
	if (req.params.path === 'authenticate') {
		res.success(req.user ? JSON.stringify(req.user.personalInfo) : '');
	} else if (Object.keys(responses).indexOf(req.params.path) >= 0) {
		responses[req.params.path](req, res);
	} else {
		logger.warn('Unknown API path was requested', {
			path: req.params.path, userID: req.user ? req.user._id : null });
		res.writeHead(404);
		return res.end('Error: The API feature requested has not been implemented.');
	}
};

