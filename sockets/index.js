/* eslint-disable global-require */

const ws = require('ws');
const games = {};

module.exports = (server) => {
	const wss = new ws.Server({ server });
	wss.on('connection', (tws) => {
		switch (tws.upgradeReq.url) {
		case '/play/': {
			let message;
			tws.on('message', (m) => {
				try {
					message = JSON.parse(m);
				} catch (e) {
					return tws.error('JSON error.');
				}
			});
			if (message) require('./game')(tws, message, games);

			tws.on('close', () => {
				if (tws.game) {
					tws.sendToGameHost({
						event: 'removeUser',
						user: tws.user,
					});
					if (tws.crew()) {
						const index = tws.game.users.indexOf(tws);
						const crewMembers = tws.crew().members;
						tws.game.users.splice(index, 1);
						tws.game.usernames.splice(index, 1);
						crewMembers.splice(crewMembers.indexOf(tws), 1);
						if (crewMembers.length === 0) {
							tws.game.crews.splice(tws.game.crews.indexOf(tws.crew()), 1);
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
				} catch (e) {
					return tws.error('JSON error.');
				}
			});
			if (message) require('./host')(tws, message, games);
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
