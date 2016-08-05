'use strict';
const ws = require('ws');
let games = {};

const maxFuzzyTime = 10000;

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
		tws.on('close', function() {
			clearInterval(tws.interval);
		});
		if (tws.upgradeReq.url == '/test') {
			tws.trysend('Socket connection successful.');
			tws.close();
		} else if (tws.upgradeReq.url == '/') {
			tws.on('message', function(m, raw) {
				console.log(m);
				try {
					m = JSON.parse(m);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (m.event == 'new-user') {
					let tgame = games[m.code];
					if (!tgame) return tws.error('Invalid game code.', 'join');
					if (!m.name) return tws.error('You must enter a username.', 'join');
					if (m.name.length > 18) return tws.error('You must enter a username with less than 18 characters.', 'join');
					if (tgame.usernames.includes(m.name)) return tws.error('Your username has been taken', 'join');
					if (tgame.hasStarted) return tws.error('Game has started.', 'join');
					tws.user = m.name;
					tws.game = tgame;
					tws.game.usernames.push(m.name);
					tws.game.users.push(tws);
					tws.game.host.trysend(JSON.stringify({
						event: 'add-loneuser',
						user: tws.user
					}));
					tws.questionIDsDone = [];
				} else if (m.event == 'add-user-to-crew') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!m.crewnum || typeof m.crewnum != 'number') return tws.error('You must enter a crew number.', 'crew');
					if (!(m.crewnum <= 9 && m.crewnum >= 1)) return tws.error('Crew number must be between 1 and 9, inclusive.', 'crew');
					if (tws.game.hasStarted) return tws.error('Game has started.', 'join');
					if (!tws.game.crews[m.crewnum]) {
						tws.crew = tws.game.crews[m.crewnum] = {
							members: [tws],
							activeQuestions: [],
							recentAnswers: [],
							streak: 0
						};
					} else if (tws.game.crews[m.crewnum].members.length >= 4) return tws.error('Crew cannot have more than 4 sailors.', 'crew');
					else (tws.crew = tws.game.crews[m.crewnum]).members.push(tws);
					tws.crewnum = m.crewnum;
					tws.game.host.trysend(JSON.stringify({
						event: 'add-user-to-crew',
						user: tws.user,
						crew: m.crewnum
					}));
				} else if (m.event == 'answer-chosen') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!m.text) return tws.error('No answer text sent.');
					for (let pastAnswer of tws.crew.recentAnswers) {
						if (pastAnswer.text == m.text && new Date().getTime() - pastAnswer.time < maxFuzzyTime) {
							return tws.trysend(JSON.stringify({event: 'answer-status', correct: true}));
						}
					}
					let tquestion;
					tws.crew.activeQuestions.forEach(function(question) {
						if (question.answers.includes(m.text)) tquestion = question;
					});
					tws.trysend(JSON.stringify({event: 'answer-status', correct: !!tquestion}));
					tws.crew.members.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'answer-submitted', correct: !!tquestion, text: m.text}));
					});
					tws.game.host.trysend(JSON.stringify({event: 'answer', correct: !!tquestion, crewnum: tws.crewnum}));
					if (tquestion) {
						tws.crew.activeQuestions.splice(tws.crew.activeQuestions.indexOf(tquestion), 1);
						let questionID = -1;
						if (tquestion.owner.questionIDsDone.length == tws.game.questions.length) tquestion.owner.questionIDsDone = [];
						while (questionID == -1 || tquestion.owner.questionIDsDone.includes(questionID)) questionID = Math.floor(Math.random() * tws.game.questions.length);
						let question = tws.game.questions[questionID];
						tws.crew.activeQuestions.push({
							text: question.text,
							answers: question.answers,
							owner: tquestion.owner
						});
						tquestion.owner.trysend(JSON.stringify({event: 'question', question: question.text}));
						if (!tquestion.owner.questionIDsDone.includes(questionID)) tquestion.owner.questionIDsDone.push(questionID);
						for (let answer of question.answers) {
							tws.crew.members[Math.floor(Math.random() * tws.crew.members.length)].trysend(JSON.stringify({event: 'correct-answer', answer}));
						}
						tws.crew.recentAnswers.push({
							text: m.text,
							time: new Date().getTime()
						});
						tws.crew.streak++;
					} else tws.crew.streak = 0;
					if (tws.crew.rockActive) {
						tws.crew.members.forEach(function(ttws) {
							ttws.trysend(JSON.stringify({event: 'rock-answer-status', correct: !!tquestion, streak: tws.crew.streak}));
						});
						if (tws.crew.streak >= 4) {
							clearTimeout(tws.crew.rockActive);
							tws.crew.rock = tws.crew.rockActive = false;
							tws.crew.members.forEach(function(ttws) {
								ttws.trysend(JSON.stringify({event: 'end-rock'}));
							});
							tws.game.host.trysend(JSON.stringify({event: 'end-rock', crewnum: tws.crewnum}));
						}
					}
					if (Math.random() < tws.crew.streak / 20 && !tws.crew.rock) {
						tws.crew.rock = true;
						tws.crew.streak = 0;
						setTimeout(function() {
							tws.crew.members.forEach(function(ttws) {
								ttws.trysend(JSON.stringify({event: 'rock'}));
							});
							tws.game.host.trysend(JSON.stringify({event: 'rock', crewnum: tws.crewnum}));
							tws.crew.rockActive = setTimeout(function() {
								tws.crew.members.forEach(function(ttws) {
									ttws.trysend(JSON.stringify({event: 'collide-rock'}));
								});
								tws.game.host.trysend(JSON.stringify({event: 'collide-rock', crewnum: tws.crewnum}));
							}, 30000);
						}, Math.random() * 8000);
					}
				} else if (m.event == 'timeout-question') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!m.text) return tws.error('No question text sent.');
					let tquestion;
					tws.crew.activeQuestions.forEach(function(question) {
						if (question.text == m.text) tquestion = question;
					});
					tws.game.host.trysend(JSON.stringify({event: 'no-answer', crewnum: tws.crewnum}));
					if (tquestion) tws.crew.activeQuestions.splice(tws.crew.activeQuestions.indexOf(tquestion), 1);
					let questionID = -1;
					if (tws.questionIDsDone.length == tws.game.questions.length) tws.questionIDsDone = [];
					while (questionID == -1 || tws.questionIDsDone.includes(questionID)) questionID = Math.floor(Math.random() * tws.game.questions.length);
					let question = tws.game.questions[questionID];
					tws.crew.activeQuestions.push({
						text: question.text,
						answers: question.answers,
						owner: tws
					});
					tws.trysend(JSON.stringify({event: 'question', question: question.text}));
					for (let answer of question.answers) {
						tws.crew.members[Math.floor(Math.random() * tws.crew.members.length)].trysend(JSON.stringify({event: 'correct-answer', answer}));
					}
				} else if (m.event == 'resend-answer') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (typeof m.text != 'string') return tws.error('No answer text sent.');
					tws.crew.members[Math.floor(Math.random() * tws.crew.members.length)].trysend(JSON.stringify({event: 'correct-answer', answer: m.text}));
				} else tws.error('Unknown socket event ' + m.event + ' received.');
			});
			tws.on('close', function() {
				if (tws.game) tws.game.host.trysend(JSON.stringify({
					event: 'remove-user',
					user: tws.user
				}));
			});
		} else if (tws.upgradeReq.url == '/host/') {
			tws.on('message', function(m, raw) {
				console.log(m);
				try {
					m = JSON.parse(m);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (m.event == 'new-game') {
					dbcs.qsets.findOne({_id: m.qsetID}, function(err, qset) {
						if (err) throw err;
						if (!qset) return tws.error('Question set not found.');
						let id = Math.floor(Math.random() * 1e6);
						while (id in games) id = Math.floor(Math.random() * 1e6);
						games[id] = {
							host: tws,
							crews: [],
							usernames: [],
							users: [],
							questions: qset.questions,
							hasStarted: false
						};
						tws.gameID = id;
						tws.game = games[id];
						tws.trysend(JSON.stringify({event: 'new-game', id: id.toString()}));
						let answers = [];
						for (let question of tws.game.questions) {
							for (let answer of question.answers) if (!answers.includes(answer)) answers.push(answer);
							for (let answer of question.incorrectAnswers) if (!answers.includes(answer)) answers.push(answer);
						}
						tws.game.answers = answers;
					});
				} else if (m.event == 'remove-user-from-crew') {
					if (!tws.game) return tws.error('Game not found.', 'dashboard');
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(ttws) {
							if (ttws.user == m.user) {
								ttws.trysend(JSON.stringify({event: 'set-state', state: 'crew'}));
								crew.members.splice(crew.members.indexOf(ttws), 1);
							}
						});
					});
				} else if (m.event == 'remove-user') {
					if (!tws.game) return tws.error('Game not found.', 'dashboard');
					tws.game.users.forEach(function(ttws, i) {
						if (ttws.user == m.user) {
							ttws.trysend(JSON.stringify({event: 'set-state', state: 'join'}));
							tws.game.users.splice(i, 1);
						}
					});
				} else if (m.event == 'start-game') {
					if (!tws.game) return tws.error('Game not found.', 'dashboard');
					if (tws.game.crews.length < 1) return tws.error('Need at least one crew to begin game.');
					tws.game.hasStarted = true;
					tws.game.users.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({
							event: 'start-game',
							state: 'game',
							answers: tws.game.answers,
							sailorsInCrew: ttws.crew.members.length
						}));
					});
					dbcs.gameplays.insert({
						_id: tws.gameplayID = generateID,
						participants: tws.game.users.length + 1,
						startTime: new Date().getTime()
					});
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(member) {
							let questionID = Math.floor(Math.random() * tws.game.questions.length),
								question = tws.game.questions[questionID];
							crew.activeQuestions.push({
								text: question.text,
								answers: question.answers,
								owner: member
							});
							member.trysend(JSON.stringify({event: 'question', question: question.text}));
							member.questionIDsDone.push(questionID);
							for (let answer of question.answers) {
								crew.members[Math.floor(Math.random() * crew.members.length)].trysend(JSON.stringify({event: 'correct-answer', answer}));
							}
						});
					});
				} else if (m.event == 'update-rank') {
					tws.game.crews[m.crewnum].members.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'update-rank', rank: m.rank}));
					});
				} else if (m.event == 'update-hp') {
					tws.game.crews[m.crewnum].members.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'update-hp', hp: m.hp}));
					});
				} else if (m.event == 'end-game') {
					if (!tws.game) return tws.error('Game not found.', 'dashboard');
					dbcs.gameplays.update({_id: tws.gameplayID}, {$set: {endTime: new Date().getTime()}});
					tws.game.users.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'end-game', state: 'game-ended'}));
					});
				} else tws.error('Unknown socket event ' + m.event + ' received.');
			});
			tws.on('close', function() {
				delete games[tws.gameID];
				dbcs.gameplays.update({_id: tws.gameplayID}, {$set: {endTime: new Date().getTime()}});
			});
		} else {
			tws.trysend(JSON.stringify({
				event: 'error',
				body: 'Invalid upgrade URL.'
			}));
			tws.close();
		}
	});
};