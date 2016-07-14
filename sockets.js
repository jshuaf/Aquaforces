const ws = require('ws');
let games = {};

const maxFuzzyTime = 5000;

module.exports = (server) => {
	let wss = new ws.Server({server});
	wss.on('connection', (tws) => {
		console.log('SOCKET CONNECT ' + tws.upgradeReq.url);

		tws.trysend = (msg) => {
			try {
				tws.send(JSON.stringify(msg));
			} catch (e) {}
		};

		tws.error = (body, state) =>
			tws.trysend({event: 'error', body, state});

		tws.checkGameExists = () => {
			if (!tws.game) return tws.error('Game not found.', 'join');
		};

		tws.sendToGameHost = (data) =>
			tws.game.host.trysend(data);

		tws.crew = () => tws.game.crews[tws.crewNumber];

		tws.randomCrewMember = () => tws.crew().members[Math.floor(Math.random() * tws.crew().members.length)];

		tws.addWhirlpool = () => {
			tws.whirlpool = true;
			const ttws = tws.randomCrewMember();
			tws.crew().members.forEach((crewMember) => {
				if (crewMember != ttws) {
					crewMember.trysend({event: 'whirlpoolAhead'});
				}
			});

			// MARK: challenge questions?
			ttws.trysend({
				event: 'whirlpoolQuestion',
				question: tws.addNewQuestion()
			});
		};

		tws.addRock = () => {
			if (tws.whirlpool) {
				return;
			}
			tws.crew().rock = {
				streak: 0
			};
			tws.crew().members.forEach((crewMember) => {
				crewMember.trysend({
					event: 'addRock',
					startTime: (new Date().getTime()) + 1500
				});
			});
		};

		tws.addNewQuestion = () => {
			let newQuestionID = 0;
			const crew = tws.crew();
			while (!newQuestionID || tws.questionsDone.includes(tws.game.questions[newQuestionID])) {
				newQuestionID = Math.floor(Math.random() * tws.game.questions.length);
			}
			const newQuestion = tws.game.questions[newQuestionID];
			tws.crew().activeQuestions.push({
				text: newQuestion.text,
				answer: newQuestion.answer,
				owner: tws
			});
			tws.trysend({
				event: 'newQuestion',
				question: newQuestion.text
			});
			const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
			ttws.trysend({
				event: 'correctAnswer',
				answer: newQuestion.answer
			});
			return newQuestion;
		};

		tws.sendAnswerEvent = (wasCorrectAnswer, crewNumber) => {
			tws.trysend({
				event: 'answerSelected',
				wasCorrectAnswer
			});
			return tws.sendToGameHost({
				event: 'answerSelected',
				crewNumber,
				wasCorrectAnswer
			});
		};

		switch (tws.upgradeReq.url) {
			case '/play/': {
				tws.on('message', function(m, raw) {
					try {
						m = JSON.parse(m);
					} catch (e) {
						return tws.error('JSON error.');
					}
					switch (m.event) {

						case 'addUser': {
							const tgame = games[m.code];
							if (!tgame) return tws.error('Invalid game code.', 'join');
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
							tws.sendToGameHost({
								event: 'addNewUser',
								user: tws.user
							});
							tws.trysend({event: 'addUser'});
							tws.questionsDone = [];
							break;
						}

						case 'addUserToCrew': {
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
									recentCorrectAnswers: [],
									streak: 0,
									rock: false,
									whirlpool: false,
									activeQuestions: [],
									hp: 100
								};
							} else if (tws.game.crews[m.crewNumber].members.length >= 6) {
								return tws.error('Crew cannot have more than 6 sailors.', 'crew');
							}
							else tws.game.crews[m.crewNumber].members.push(tws);
							tws.crewNumber = m.crewNumber;
							tws.sendToGameHost({
								event: 'addUserToCrew',
								user: tws.user,
								crew: m.crewNumber
							});
							tws.trysend({
								event: 'addUserToCrew'
							});
							break;
						}

						case 'answerSelected': {
							tws.checkGameExists();
							if (Math.random() < 0.05 * tws.crew().streak) {
								tws.crew().streak = 0;
								if (Math.random() < 0.000000000000000000000000000000000000000000000000000000000000001) {
									tws.addWhirlpool();
								} else {
									tws.addRock();
								}
							}
							if (!m.answer) return tws.error('No answer text sent.');
							const crew = tws.crew();

							// fuzzy answer checking
							crew.recentCorrectAnswers.forEach((pastAnswer) => {
								if (pastAnswer.time < maxFuzzyTime) {
									if (pastAnswer.text == m.answer) {
										tws.sendAnswerEvent(true, m.crewNumber);
										if (!tws.crew().rock.length && !tws.whirlpool) tws.crew().streak += 1;
									}
								} else {
									const pastAnswerIndex = crew.recentCorrectAnswers.indexOf(pastAnswer);
									crew.recentCorrectAnswers.splice(pastAnswerIndex, 1);
								}
							});

							let correspondingQuestion;
							tws.crew().activeQuestions.forEach((activeQuestion) => {
								if (activeQuestion.answer == m.answer) {
									correspondingQuestion = activeQuestion;
									tws.crew().activeQuestions.splice(tws.crew().activeQuestions.indexOf(correspondingQuestion), 1);
									tws.sendAnswerEvent(true, m.crewNumber);
									tws.questionsDone.push(correspondingQuestion);

									if (!tws.crew().rock.length && !tws.whirlpool) tws.crew().streak += 1;
									if (tws.crew().rock) {
										tws.crew().rock.streak += 1;
										if (tws.crew().rock.streak >= 5) {
											tws.crew().rock = {};
											tws.crew().members.forEach((crewMember) => {
												crewMember.trysend({
													event: 'endRock'
												});
											});
										}
									}

									const newQuestion = correspondingQuestion.owner.addNewQuestion();
									tws.crew().recentCorrectAnswers.push(newQuestion.answer);
								}
							});
							if (!correspondingQuestion) {
								// incorrect answers
								tws.crew().hp -= 5;
								tws.crew().streak = 0;
								tws.sendAnswerEvent(false, m.crewNumber);
								tws.crew().members.forEach((member) => {
									member.trysend({
										event: 'updateHP',
										hp: tws.crew().hp
									});
								});
							}
							break;
						}

						case 'questionTimeout': {
							tws.checkGameExists();
							if (!m.question) {
								return tws.error('No question text sent.');
							}

							let correspondingQuestion;
							tws.crew().activeQuestions.forEach((activeQuestion) => {
								if (activeQuestion.text == m.question) {
									correspondingQuestion = activeQuestion;
									tws.crew().activeQuestions.splice(
										tws.crew().activeQuestions.indexOf(correspondingQuestion), 1);

									correspondingQuestion.owner.addNewQuestion();
									tws.crew().streak = 0;
								} else if (m.event == 'resendAnswer') {
									tws.checkGameExists();
									if (typeof m.text != 'string') {
										return tws.error('No answer text sent.');
									}
									const crew = tws.crew();
									const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
									ttws.trysend({
										event: 'correctAnswer',
										answer: m.answer
									});
								}
							});
							if (!correspondingQuestion) {
								tws.error("Unknown question timed out.");
							}
							break;
						}

						case 'answerPassedThreshold': {
							const answerToResend = m.answer;
							tws.crew().activeQuestions.forEach((activeQuestion) => {
								if (activeQuestion.answer == answerToResend) {
									ttws = tws.randomCrewMember();
									return ttws.trysend({
										event: 'correctAnswer',
										answer: answerToResend
									});
								}
							});
							break;
						}

						default: {
							tws.error('Unknown socket event ' + m.event + ' received.');
						}
					}
				});
				tws.on('close', () => {
					if (tws.game) {
						tws.sendToGameHost({
							event: 'removeUser',
							user: tws.user
						});
						const index = tws.game.users.indexOf(tws);
						tws.game.users.splice(index, 1);
						tws.game.usernames.splice(index, 1);
					}
				});
				break;
			}

			case '/host/': {
				tws.on('message', (m, raw) => {
					try {
						m = JSON.parse(m);
					} catch (e) {
						return tws.error('JSON error.');
					}

					switch (m.event) {
						case 'newGame': {
							const id = Math.floor(Math.random() * 1e4);
							games[id] = {
								host: tws,
								crews: [],
								usernames: [],
								users: [],
								questions: [],
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
							tws.trysend({event: 'newGame', id});
							const answers = [];
							for (const question of tws.game.questions) {
								if (!answers.includes(question.answer)) {
									answers.push(question.answer);
								}
								for (const answer of question.incorrectAnswers) {
									if (!answers.includes(answer)) answers.push(answer);
								}
							}

							tws.game.answers = answers;
							break;
						}

						case 'removeUserFromCrew': {
							tws.checkGameExists();
							tws.game.crews.forEach((crew) => {
								crew.members.forEach((ttws) => {
									if (ttws.user == m.user) {
										crew.members.splice(crew.members.indexOf(ttws), 1);
										ttws.trysend({
											event: 'removeUserFromCrew'
										});
									}
								});
							});
							break;
						}

						case 'removeUser': {
							if (!tws.game) {
								return tws.error('Game not found.', 'join');
							}
							tws.game.users.forEach((ttws, i) => {
								if (ttws.user == m.user) {
									tws.game.users.splice(i, 1);
									tws.game.usernames.splice(i, 1);
									ttws.trysend({
										event: 'removeUserFromGame'
									});
								}
							});
							break;
						}

						case 'startGame': {
							tws.checkGameExists();
							if (tws.game.crews.length < 1) return tws.error('Need more crews to begin game.');
							Object.keys(tws.game.crews).forEach((crewNumber) => {
								const crew = tws.game.crews[crewNumber];
								if (crew.members.length < 2) return tws.error('Need at least two people in every crew.');
								else if (crew.members.length > 4) return tws.error('Maximum four people in every crew.');
							});
							tws.game.hasStarted = true;
							tws.game.crews.forEach((crew) => {
								const crewSize = crew.members.length;
								crew.members.forEach((ttws) => {
									ttws.trysend({
										event: 'startGame',
										answers: tws.game.answers,
										crewSize
									});
								});
							});
							tws.trysend({
								event: 'startGame'
							});
							tws.game.crews.forEach((crew) => {
								crew.members.forEach((member) => {
									const questionID = Math.floor(Math.random() * tws.game.questions.length);
									const question = tws.game.questions[questionID];
									member.crew().activeQuestions.push({
										text: question.text,
										answer: question.answer,
										owner: member
									});
									member.trysend({
										event: 'newQuestion',
										question: question.text
									});
									const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
									ttws.trysend({
										event: 'correctAnswer', answer: question.answer
									});
									ttws.questionsDone.push(question);
								});
							});
							break;
						}

						case 'endGame': {
							tws.checkGameExists();
							tws.game.users.forEach((ttws) => {
								ttws.trysend({
									event: 'endGame'
								});
							});
							break;
						}

						default: {
							tws.error('Unknown socket event ' + m.event + ' received.');
						}
					}
				});
				break;
			}

			case '/console/': {
				// MARK: console sockets
				break;
			}

			default: {
				tws.trysend({
					event: 'error',
					body: 'Invalid upgrade URL.'
				});
				tws.close();
			}
		}
	});
};
