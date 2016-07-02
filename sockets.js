'use strict';
const ws = require('ws');
let games = {};

const maxFuzzyTime = 10000;
const correctAnswerIncrement = 0.1;

// event names to change from GAME:
// addUser goes to addUser
// addUserToCrew goes to addUserToCrew
// answerSelected goes to answerSelected
// text within answerSelected goes to answer
// questionTimeout goes to questionTimeout
// text goes to question
// resend-answer needs to be implemented

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

		tws.checkGameExists = () => {
			if (!tws.game) return tws.error('Game not found.', 'join');
		};

		if (tws.upgradeReq.url == '/') {
			tws.on('message', function(m, raw) {
				try {
					m = JSON.parse(m);
				} catch (e) {
					return tws.error('JSON error.');
				}
				if (m.event == 'addUser') {
					const tgame = games[m.code];
					if (!tgame) return tws.error('Invalid game code.', 'join');
					// MARK: remove states from messages
					if (!m.name) {
						return tws.error('You must enter a username.', 'join');
					} else if (m.name.length > 24) {
						return tws.error('You must enter a username less than 24 characters.', 'join');
					} else if (tgame.usernames.includes(m.name)) {
						return tws.error('Your username has been taken', 'join');
					} else if (tgame.hasStarted) {
						return tws.error('Game has started.', 'join');
					}
					tws.user = m.name;
					tws.game = tgame;
					tws.game.usernames.push(m.name);
					tws.game.users.push(tws);
					tws.game.host.trysend(JSON.stringify({
						event: 'addNewUser',
						user: tws.user
					}));
					tws.trysend(JSON.stringify({
						event: 'addUser'
					}));
					tws.questionsDone = [];
				} else if (m.event == 'addUserToCrew') {
					tws.checkGameExists();
					if (!m.crewNumber || typeof m.crewNumber != 'number') {
						return tws.error('You must enter a crew number.', 'crew');
					} else if (!(m.crewNumber <= 12 && m.crewNumber >= 1)) {
						return tws.error('Crew number must be between 1 and 12, inclusive.', 'crew');
					} else if (tws.game.hasStarted) {
						return tws.error('Game has started.', 'join');
					} else if (!tws.game.crews[m.crewNumber]) {
						tws.game.crews[m.crewNumber] = {
							members: [tws],
							recentAnswers: []
						};
					} else if (tws.game.crews[m.crewNumber].members.length >= 6) {
						return tws.error('Crew cannot have more than 6 sailors.', 'crew');
					}
					else tws.game.crews[m.crewNumber].members.push(tws);
					tws.crewNumber = m.crewNumber;
					tws.game.host.trysend(JSON.stringify({
						event: 'addUserToCrew',
						user: tws.user,
						crew: m.crewnum
					}));
				} else if (m.event == 'answerSelected') {
					tws.checkGameExists();
					if (!m.answer) return tws.error('No answer text sent.');
					let crew = tws.game.crews[tws.crewNumber];

					// fuzzy answer checking
					crew.recentAnswers.forEach(function(pastAnswer) {
						if (pastAnswer.text == m.answer && new Date().getTime() - pastAnswer.time < maxFuzzyTime) {
							tws.trysend(JSON.stringify({
								event: 'answerSelected',
								wasCorrectAnswer: true
							}));
							return tws.game.host.trysend(JSON.stringify({
								event: 'answerSelected',
								crewNumber: m.crewNumber,
								wasCorrectAnswer: true
							}));
						}
					});

					// incorrect answers
					tws.trysend(JSON.stringify({
						event: 'answerSelected',
						wasCorrectAnswer: false
					}));
					tws.game.host.trysend(JSON.stringify({
						event: 'answerSelected',
						crewNumber: m.crewNumber,
						wasCorrectAnswer: false
					}));

					let correspondingQuestion;
					tws.game.activeQuestions.forEach((activeQuestion) => {
						if (activeQuestion.answer == m.answer) {
							correspondingQuestion = activeQuestion;
							tws.game.activeQuestions.splice(tws.game.activeQuestions.indexOf(correspondingQuestion), 1);
							let newQuestionID = 0;
							while (!newQuestionID || tws.questionsDone.includes(tws.game.questions[newQuestionID])) {
								newQuestionID = Math.floor(Math.random() * tws.game.questions.length);
							}
							const newQuestion = tws.game.questions[newQuestionID];
							tws.game.activeQuestions.push({
								text: newQuestion.text,
								answer: newQuestion.answer,
								owner: correspondingQuestion.owner
							});
							correspondingQuestion.owner.trysend(JSON.stringify({
								event: 'newQuestion',
								question: newQuestion.text
							}));
							let ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
							ttws.trysend(JSON.stringify({
								event: 'correctAnswer',
								answer: newQuestion.answer
							}));
							ttws.questionsDone.push(correspondingQuestion);
							return crew.recentAnswers.push({
								text: m.answer,
								time: new Date().getTime()
							});
						}
					});

					if (!correspondingQuestion) {
						tws.error("Unknown answer clicked.");
					}
				} else if (m.event == 'questionTimeout') {
					tws.checkGameExists();
					if (!m.question) {
						return tws.error('No question text sent.');
					}

					let correspondingQuestion;
					tws.game.activeQuestions.forEach((activeQuestion) => {
						if (activeQuestion.text == m.question) {
							correspondingQuestion = activeQuestion;

							tws.game.activeQuestions.splice(
								tws.game.activeQuestions.indexOf(correspondingQuestion), 1);

							let newQuestionID = 0;
							while (!newQuestionID || tws.questionsDone.includes(tws.game.questions[newQuestionID])) {
								newQuestionID = Math.floor(Math.random() * tws.game.questions.length);
							}
							const question = tws.game.questions[newQuestionID];
							tws.game.activeQuestions.push({
								text: newQuestion.text,
								answer: newQuestion.answer,
								owner: tws
							});
							tws.trysend(JSON.stringify({
								event: 'newQuestion',
								question: newQuestion.text
							}));
							const crew = tws.game.crews[tws.crewNumber];
							const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
							ttws.trysend(JSON.stringify({
								event: 'correctAnswer',
								answer: newQuestion.answer
							}));
							ttws.questionsDone.push(correspondingQuestion);
						} else if (m.event == 'resendAnswer') {
							tws.checkGameExists();
							if (typeof m.text != 'string') {
								return tws.error('No answer text sent.');
							}
							const crew = tws.game.crews[tws.crewNumber];
							const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
							ttws.trysend(JSON.stringify({
								event: 'correctAnswer',
								answer: m.answer
							}));
						}
					});
					if (!correspondingQuestion) {
						tws.error("Unknown question timed out.");
					}
				} else {
					tws.error('Unknown socket event ' + m.event + ' received.');
				}
			});
			tws.on('close', function() {
				if (tws.game) {
					tws.game.host.trysend(JSON.stringify({
					event: 'removeUser',
					user: tws.user
					}));
				}
			});
		} else if (tws.upgradeReq.url == '/host/') {
			tws.on('message', function(m, raw) {
				try {
					m = JSON.parse(m);
				} catch (e) {
					return tws.error('JSON error.');
				}

				if (m.event == 'newGame') {
					const id = Math.floor(Math.random() * 1e6);
					games[id] = {
						host: tws,
						crews: [],
						usernames: [],
						users: [],
						questions: [],
						activeQuestions: [],
						hasStarted: false
					};

					// generate random math questions
					// MARK: pull data from database
					for (let i = 0; i < 100; i++) {
						games[id].questions.push({
							text: 'What\'s ' + i + ' + ' + i + '?',
							answer: (2 * i).toString(),
							incorrectAnswers: [i.toString(), i.toString() + i.toString(),
								(2 * i + 1).toString(), (2 * i - 1).toString()]
						});
					}

					tws.game = games[id];
					tws.trysend(JSON.stringify({event: 'new-game', id}));
					const answers = [];
					for (const question of tws.game.questions) {
						if (!answers.includes(question.answer)) {
							answers.push(question.answer);
						}
					}
					for (const answer of question.incorrectAnswers) {
						if (!answers.includes(answer)) answers.push(answer);
					}
					tws.game.answers = answers;
				} else if (m.event == 'removeUserFromCrew') {
					tws.checkGameExists();
					tws.game.crews.forEach((crew) => {
						crew.members.forEach((ttws) => {
							if (ttws.user == m.user) {
								ttws.trysend(JSON.stringify({event: 'set-state', state: 'crew'}));
								crew.members.splice(crew.members.indexOf(ttws), 1);
							}
						});
					});
				} else if (m.event == 'removeUser') {
					if (!tws.game) {
						return tws.error('Game not found.', 'join');
					}
					tws.game.users.forEach((ttws, i) => {
						if (ttws.user == m.user) {
							ttws.trysend(JSON.stringify({event: 'setState', state: 'join'}));
							tws.game.users.splice(i, 1);
						}
					});
				} else if (m.event == 'startGame') {
					tws.checkGameExists();
					if (tws.game.crews.length < 1) return tws.error('Need more crews to begin game.');
					tws.game.hasStarted = true;
					tws.game.users.forEach((ttws) => {
						ttws.trysend(JSON.stringify({event: 'startGame', state: 'game', answers: tws.game.answers}));
					});
					tws.game.crews.forEach((crew) => {
						crew.members.forEach((member) => {
							const questionID = Math.floor(Math.random() * tws.game.questions.length);
							const question = tws.game.questions[questionID];
							tws.game.activeQuestions.push({
								text: question.text,
								answer: question.answer,
								owner: member
							});
							member.trysend(JSON.stringify({
								event: 'newQuestion',
								question: question.text
							}));
							const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
							ttws.trysend(JSON.stringify({
								event: 'correctAnswer', answer: question.answer
							}));
							ttws.questionIDsDone.push(questionID);
						});
					});
				} else if (m.event == 'endGame') {
					tws.checkGameExists();
					tws.game.users.forEach((ttws) => {
						ttws.trysend(JSON.stringify({
							event: 'endGame',
							state: 'gameEnded'
						}));
					});
				} else {
					tws.error('Unknown socket event ' + m.event + ' received.');
				}
			});
		} else if (tws.upgradeReq.url == '/console/') {
			// MARK: console sockets
		} else {
			tws.trysend(JSON.stringify({
				event: 'error',
				body: 'Invalid upgrade URL.'
			}));
			tws.close();
		}
	});
};
