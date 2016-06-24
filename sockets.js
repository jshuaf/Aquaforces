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
			return tws.trysend(JSON.stringify({event: 'error', body, state}));
		};
		if (tws.upgradeReq.url == '/') {
			tws.on('message', function(message, raw) {
				console.log(message);
				try {
					message = JSON.parse(message);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (message.event == 'new-user') {
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
					tws.questionsIDsDone = [];
				} else if (message.event == 'add-user-to-crew') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!message.crewno || typeof message.crewno != 'number') return tws.error('You must enter a crew number.', 'crew');
					if (!(message.crewno <= 12 && message.crewno >= 1)) return tws.error('crew number must be between 1 and 12, inclusive.', 'crew');
					if (tws.game.hasStarted) return tws.error('Game has started.', 'join');
					if (!tws.game.crews[message.crewno]) {
						tws.game.crews[message.crewno] = {
							hp: 1,
							position: 0,
							members: [tws]
						};
					} else if (tws.game.crews[message.crewno].members.length >= 6) return tws.error('Crew cannot have more than 6 sailors.', 'crew');
					else tws.game.crews[message.crewno].members.push(tws);
					tws.crewno = message.crewno;
					tws.game.host.trysend(JSON.stringify({
						event: 'add-user-to-crew',
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
				if (message.event == 'new-game') {
					let id = Math.floor(Math.random() * 1e6);
					games[id] = {
						host: tws,
						crews: [],
						usernames: [],
						users: [],
						questions: [],
						hasStarted: false
					};
					for (let i = 0; i < 100; i++) {
						games[id].questions.push({
							text: 'What\'s ' + i + ' + ' + i + '?',
							answer: (2 * i).toString(),
							incorrectAnswers: [i.toString(), i.toString() + i.toString(), (2 * i + 1).toString(), (2 * i - 1).toString()]
						});
					}
					tws.game = games[id];
					tws.trysend(JSON.stringify({event: 'new-game', id}));
					var answers = [];
					for (let question of tws.game.questions) {
						if (!answers.includes(question.answer)) answers.push(question.answer);
						for (let answer of question.incorrectAnswers) {
							if (!answers.includes(answer)) answers.push(answer);
						}
					}
					tws.game.answers = answers;
				} else if (message.event == 'remove-user-from-crew') {
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(ttws) {
							if (ttws.user == message.user) {
								ttws.trysend(JSON.stringify({event: 'set-state', state: 'crew'}));
								crew.splice(crew.indexOf(ttws), 1);
							}
						});
					});
				} else if (message.event == 'remove-user') {
					tws.game.users.forEach(function(ttws, i) {
						if (ttws.user == message.user) {
							ttws.trysend(JSON.stringify({event: 'set-state', state: 'join'}));
							tws.game.users.splice(i, 1);
						}
					});
				} else if (message.event == 'start-game') {
					if (tws.game.crews.length < 1) return tws.error('Need more crews to begin game.');
					tws.game.hasStarted = true;
					tws.game.users.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'start-game', state: 'game', answers: tws.game.answers}));
					});
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(member) {
							let question = tws.game.questions[Math.floor(Math.random() * tws.game.questions.length)];
							member.trysend(JSON.stringify({event: 'question', question: question.text}));
							crew.members[Math.floor(Math.random() * crew.length)].trysend(JSON.stringify({event: 'correct-answer', answer: question.answer}));
						});
					});
				}
			});
		} else if (tws.upgradeReq.url == '/console/') {

		} else {
			tws.trysend(JSON.stringify({
				event: 'error',
				body: 'Invalid upgrade URL.'
			}));
			tws.close();
		}
	});
};
