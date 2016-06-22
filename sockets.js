'use strict';
const ws = require('ws');
let games = {};

module.exports = function(server) {
	let wss = new ws.Server({server});
	wss.on('connection', function(tws) {
		console.log('SOCKET CONNECT ' + tws.upgradeReq.url);
		tws.trysend = function(msg) {
			try {
				tws.send(msg);
			} catch (e) {}
		};
		tws.error = function(body, state) {
			return tws.trysend(JSON.stringify({event: 'err', body, state}));
		};
		if (tws.upgradeReq.url == '/') {
			tws.on('message', function(message, raw) {
				console.log(message);
				try {
					message = JSON.parse(message);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (message.event == 'user') {
					let tgame = games[message.code];
					if (!tgame) return tws.error('Invalid game code.', 'join');
					if (!message.name) return tws.error('You must enter a username.', 'join');
					if (message.name.length > 24) return tws.error('You must enter a username less than 24 characters.', 'join');
					if (tgame.usernames.includes(message.name)) return tws.error('Your username has been taken', 'join');
                    if (tgame.hasStarted) return tws.error('Game has started.', 'join');
					tws.user = message.name;
					tws.game = tgame;
					tws.game.usernames.push(message.name);
					tws.game.users.push(tws);
					tws.game.host.trysend(JSON.stringify({
						event: 'add-loneuser',
						user: tws.user
					}));
				} else if (message.event == 'crew') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!message.crewno || typeof message.crewno != 'number') return tws.error('You must enter a crew number.', 'crew');
					if (!(message.crewno <= 12 && message.crewno >= 1)) return tws.error('crew number must be between 1 and 12, inclusive.', 'crew');
                    if (tws.game.hasStarted) return tws.error('Game has started.', 'join');
					if (!tws.game.crews[message.crewno]) {
						tws.game.crews[message.crewno] = {
							hp: 1,
							members: [tws]
						};
					} else if (tws.game.crews[message.crewno].members.length >= 4) {
						return tws.error('Crew cannot have more than 4 sailors.', 'crew');
					} else {
						tws.game.crews[message.crewno].members.push(tws);
					}
					tws.crewno = message.crewno;
					tws.game.host.trysend(JSON.stringify({
						event: 'crewuser',
						user: tws.user,
						crew: message.crewno
					}));
				}
			});
			tws.on('close', function() {
				if (tws.game) tws.game.host.trysend(JSON.stringify({
					event: 'removeuser',
					user: tws.user
				}));
			});
		} else if (tws.upgradeReq.url == '/host/') {
			tws.on('message', function(message, raw) {
				console.log(message);
				try {
					message = JSON.parse(message);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (message.event == 'newgame') {
					let id = Math.floor(Math.random() * 1e6);
					games[id] = {
						host: tws,
						crews: [],
						usernames: [],
						users: [],
						questions: [{
							type: 'number',
							text: 'What\'s 1 + 1?',
							answer: 2
						}],
                        hasStarted: false
					};
					tws.game = games[id];
					return tws.trysend(JSON.stringify({event: 'startgame', id}));
				} else if (message.event == 'uncrewuser') {
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(ttws) {
							if (ttws.user == message.user) ttws.trysend(JSON.stringify({event: 'set-state', state: 'crew'}));
						});
					});
				} else if (message.event == 'removeuser') {
					tws.game.users.forEach(function(ttws, i) {
						if (ttws.user == message.user) {
                            ttws.trysend(JSON.stringify({event: 'set-state', state: 'join'}));
                            tws.game.users.splice(i, 1);
                        }
					});
				} else if (message.event == 'startgame') {
					if (tws.game.crews.length < 1) {
						return tws.error('Need more crews to begin game.', 'game');
					}
                    tws.game.hasStarted = true;
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(socket) {
							socket.trysend(JSON.stringify({event: 'set-state', state: 'game'}));
						});
					});
				}
			});
        } else if (tws.upgradeReq.url == '/console/') {
            
		} else {
			tws.trysend(JSON.stringify({
				event: 'err',
				body: 'Invalid upgrade URL.'
			}));
			tws.close();
		}
	});
};