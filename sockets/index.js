/* eslint-disable global-require */

const ws = require('ws');
const logger = require('../logger');
const games = {};

module.exports = (server) => {
	const wss = new ws.Server({ server });
	wss.on('connection', (tws) => {
		require('./helpers')(tws);
		switch (tws.upgradeReq.url) {
		case '/play/': {
			let message;
			tws.on('message', (m) => {
				try {
					message = JSON.parse(m);
					if (message) require('./game')(tws, message, games);
				} catch (error) {
					logger.error('Error on game socket backend', error);
					return tws.error('Server error');
				}
			});

			tws.on('close', () => {
				if (tws.game) {
					tws.sendToGameHost({
						event: 'removeUserFromGame',
						username: tws.username,
					});
					if (tws.crew()) {
						tws.game.users.splice(tws.game.users.indexOf(tws), 1);
						tws.crew().members.splice(tws.crew().members.indexOf(tws), 1);
						if (tws.crew().members.length === 0) {
							delete tws.game.crews[tws.crewNumber];
						}
					}
				}
			});
			break;
		}
		case '/host/': {
			let message;
			tws.on('message', (m) => {
				try {
					message = JSON.parse(m);
					if (message) require('./host')(tws, message, games);
				} catch (error) {
					logger.error('Error on game host socket backend', error);
					return tws.error('Server error.');
				}
			});
			tws.on('close', () => {
				Object.keys(games).forEach((gameID) => {
					const game = games[gameID];
					if (game.host === tws) {
						return delete games[gameID];
					}
				});
			});
			break;
		}
		default: {
			tws.trysend({
				event: 'error',
				body: 'Invalid upgrade URL.',
			});
			tws.close();
		}
		}
	});
};
