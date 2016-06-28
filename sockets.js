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
		if (tws.upgradeReq.url == '/') {
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
					if (m.name.length > 24) return tws.error('You must enter a username less than 24 characters.', 'join');
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
					if (!(m.crewnum <= 12 && m.crewnum >= 1)) return tws.error('Crew number must be between 1 and 12, inclusive.', 'crew');
					if (tws.game.hasStarted) return tws.error('Game has started.', 'join');
					if (!tws.game.crews[m.crewnum]) {
						tws.game.crews[m.crewnum] = {
							members: [tws],
							recentAnswers: []
						};
					} else if (tws.game.crews[m.crewnum].members.length >= 6) return tws.error('Crew cannot have more than 6 sailors.', 'crew');
					else tws.game.crews[m.crewnum].members.push(tws);
					tws.crewnum = m.crewnum;
					tws.game.host.trysend(JSON.stringify({
						event: 'add-user-to-crew',
						user: tws.user,
						crew: m.crewnum
					}));
				} else if (m.event == 'answer-chosen') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!m.text) return tws.error('No answer text sent.', 'join');
					let crew = tws.game.crews[tws.crewnum];
					crew.recentAnswers.forEach(function(pastAnswer) {
						if (pastAnswer.text == m.text && new Date().getTime() - pastAnswer.time < maxFuzzyTime) {
							return ttws.trysend(JSON.stringify({event: 'correct-answer', answer: question.answer}));
						}
					});
					let qid;
					tws.game.activeQuestionIDs.forEach(function(questionID) {
						if (tws.game.questions[questionID].answer == m.text) qid = questionID;
					});
					tws.trysend(JSON.stringify({event: 'answer-status', correct: !!qid}));
					tws.game.host.trysend(JSON.stringify({event: 'answer', correct: !!qid, crewnum: tws.crewnum}));
					if (qid) {
						tws.game.activeQuestionIDs.splice(tws.game.activeQuestionIDs.indexOf(qid), 1);
						let questionID = 0;
						while (!questionID || tws.questionIDsDone.includes(questionID)) questionID = Math.floor(Math.random() * tws.game.questions.length);
						let question = tws.game.questions[questionID];
						tws.game.activeQuestionIDs.push(questionID);
						tws.trysend(JSON.stringify({event: 'question', question: question.text}));
						let ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
						ttws.trysend(JSON.stringify({event: 'correct-answer', answer: question.answer}));
						ttws.questionIDsDone.push(questionID);
						crew.recentAnswers.push({
							text: m.text,
							time: new Date().getTime()
						});
					}
				} else if (m.event == 'timeout-question') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (!m.text) return tws.error('No question text sent.', 'join');
					let qid;
					tws.game.activeQuestionIDs.forEach(function(questionID) {
						if (tws.game.questions[questionID].text == m.text) qid = questionID;
					});
					tws.game.host.trysend(JSON.stringify({event: 'no-answer', crewnum: tws.crewnum}));
					if (qid) tws.game.activeQuestionIDs.splice(tws.game.activeQuestionIDs.indexOf(qid), 1);
					let questionID = 0;
					while (!questionID || tws.questionIDsDone.includes(questionID)) questionID = Math.floor(Math.random() * tws.game.questions.length);
					let question = tws.game.questions[questionID];
					tws.game.activeQuestionIDs.push(questionID);
					tws.trysend(JSON.stringify({event: 'question', question: question.text}));
					let crew = tws.game.crews[tws.crewnum],
						ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
					ttws.trysend(JSON.stringify({event: 'correct-answer', answer: question.answer}));
					ttws.questionIDsDone.push(questionID);
				} else if (m.event == 'resend-answer') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (typeof m.text != 'string') return tws.error('No answer text sent.', 'join');
					let crew = tws.game.crews[tws.crewnum],
						ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
					ttws.trysend(JSON.stringify({event: 'correct-answer', answer: m.text}));
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
					let id = Math.floor(Math.random() * 1e6);
					games[id] = {
						host: tws,
						crews: [],
						usernames: [],
						users: [],
						questions: [],
						activeQuestionIDs: [],
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
				} else if (m.event == 'remove-user-from-crew') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(ttws) {
							if (ttws.user == m.user) {
								ttws.trysend(JSON.stringify({event: 'set-state', state: 'crew'}));
								let crew = ttws.game.crews[ttws.crewnum].members;
								crew.splice(crew.indexOf(ttws), 1);
							}
						});
					});
				} else if (m.event == 'remove-user') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					tws.game.users.forEach(function(ttws, i) {
						if (ttws.user == m.user) {
							ttws.trysend(JSON.stringify({event: 'set-state', state: 'join'}));
							tws.game.users.splice(i, 1);
						}
					});
				} else if (m.event == 'start-game') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					if (tws.game.crews.length < 1) return tws.error('Need more crews to begin game.');
					tws.game.hasStarted = true;
					tws.game.users.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'start-game', state: 'game', answers: tws.game.answers}));
					});
					tws.game.crews.forEach(function(crew) {
						crew.members.forEach(function(member) {
							let questionID = Math.floor(Math.random() * tws.game.questions.length),
								question = tws.game.questions[questionID];
							tws.game.activeQuestionIDs.push(questionID);
							member.trysend(JSON.stringify({event: 'question', question: question.text}));
							let ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
							ttws.trysend(JSON.stringify({event: 'correct-answer', answer: question.answer}));
							ttws.questionIDsDone.push(questionID);
						});
					});
				} else if (m.event == 'end-game') {
					if (!tws.game) return tws.error('Game not found.', 'join');
					tws.game.users.forEach(function(ttws) {
						ttws.trysend(JSON.stringify({event: 'end-game', state: 'game-ended'}));
					});
				} else tws.error('Unknown socket event ' + m.event + ' received.');
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