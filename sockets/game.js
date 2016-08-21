module.exports = (tws, m, games) => {
	/* eslint-disable global-require */
	require('./helpers')(tws);
	/* eslint-enable global-require */

	const maxFuzzyTime = 5000;

	switch (m.event) {
	case 'joinGame': {
		const game = games[m.id];
		if (!game) return tws.error('Invalid game code.', 'Make sure you type it correctly!');
		if (!m.username) {
			return tws.error('You must enter a username.', 'Be creative!');
		} else if (m.username.length > 24) {
			return tws.error('You must enter a username less than 24 characters.');
		} else if (tws.usernames().includes(m.name)) {
			return tws.error('Your username has been taken', 'Be quicker next time.');
		} else if (game.hasStarted) {
			return tws.error('Game has started.', 'Jump in next time!');
		}
		tws.username = m.username;
		tws.game = game;
		tws.questionsDone = [];
		tws.game.users.push(tws);
		tws.sendToGameHost({
			event: 'addNewUser',
			user: tws.user,
		});
		tws.trysend({ event: 'joinGame', username: m.username, id: m.id });
		break;
	}
	case 'addUserToCrew': {
		tws.checkGameExists();
		if (!m.crewNumber || typeof m.crewNumber !== 'number') {
			return tws.error('You must enter a crew number.');
		} else if (!(m.crewNumber <= 12 && m.crewNumber >= 1)) {
			return tws.error('Invalid crew number', 'Pick a crew number between 1 and 12.');
		} else if (tws.game.hasStarted) {
			return tws.error('Game has started.', 'Jump in next time!');
		} else if (!tws.game.crews[m.crewNumber]) {
			tws.game.crews[m.crewNumber] = {
				members: [tws],
				recentCorrectAnswers: [],
				streak: 0,
				rock: false,
				whirlpool: false,
				activeQuestions: [],
				hp: 100,
			};
		} else if (tws.game.crews[m.crewNumber].members.length >= 4) {
			return tws.error('Your crew is full.', 'Crews can have 2 - 4 sailors.');
		} else tws.game.crews[m.crewNumber].members.push(tws);
		tws.crewNumber = m.crewNumber;
		tws.sendToGameHost({
			event: 'addUserToCrew',
			user: tws.user,
			crew: m.crewNumber,
		});
		tws.trysend({
			event: 'addUserToCrew',
		});
		break;
	}
	case 'answerSelected': {
		tws.checkGameExists();

		if (Math.random() < 0.05 * tws.crew().streak) {
			tws.crew().streak = 0;
			if (Math.random() < 0) {
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
				if (pastAnswer.text === m.answer) {
					tws.sendAnswerEvent(true, m.crewNumber, m.answer);
					if (!tws.crew().rock && !tws.whirlpool) tws.crew().streak += 1;
				}
			} else {
				const pastAnswerIndex = crew.recentCorrectAnswers.indexOf(pastAnswer);
				crew.recentCorrectAnswers.splice(pastAnswerIndex, 1);
			}
		});

		let correspondingQuestion;
		tws.crew().activeQuestions.forEach((activeQuestion) => {
			if (activeQuestion.answer === m.answer) {
				correspondingQuestion = activeQuestion;
				tws.crew().activeQuestions.splice(
						tws.crew().activeQuestions.indexOf(correspondingQuestion), 1);
				tws.sendAnswerEvent(true, m.crewNumber, m.answer);
				tws.questionsDone.push(correspondingQuestion);
				if (!tws.crew().rock && !tws.whirlpool) tws.crew().streak += 1;
				if (tws.crew().rock) {
					tws.crew().rock.correctAnswers += 1;
					if (tws.crew().rock.correctAnswers >= 5) {
						tws.crew().rock = false;
						tws.crew().members.forEach((crewMember) => {
							crewMember.trysend({
								event: 'endRock',
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
			tws.sendAnswerEvent(false, m.crewNumber, m.answer);
			tws.crew().members.forEach((member) => {
				member.trysend({
					event: 'updateHP',
					hp: tws.crew().hp,
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

		let correspondingQuestion = null;
		tws.crew().activeQuestions.forEach((activeQuestion) => {
			if (activeQuestion.text === m.question) {
				correspondingQuestion = activeQuestion;
				tws.crew().activeQuestions.splice(
								tws.crew().activeQuestions.indexOf(correspondingQuestion), 1);

				correspondingQuestion.owner.addNewQuestion();
				tws.crew().streak = 0;
			} else if (m.event === 'resendAnswer') {
				tws.checkGameExists();
				if (typeof m.text !== 'string') {
					return tws.error('No answer text sent.');
				}
				const crew = tws.crew();
				const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
				ttws.trysend({
					event: 'correctAnswer',
					answer: m.answer,
				});
			}
		});
		if (!correspondingQuestion) {
			tws.error('Unknown question timed out.');
		}
		break;
	}
	case 'whirlpoolQuestionTimeout': {
		tws.crew().whirlpool = { present: false, question: null };
		tws.crew().members.forEach((member) => {
			member.trysend({ event: 'whirlpoolConclusion', wasCorrect: false });
		});
		tws.sendToGameHost({
			event: 'whirlpoolStatusChanged',
			status: 'timeout',
			crewNumber: tws.crewNumber,
		});
		console.log(tws.crewNumber);
		break;
	}
	case 'answerPassedThreshold': {
		const answerToResend = m.answer;
		tws.crew().activeQuestions.forEach((activeQuestion) => {
			if (activeQuestion.answer === answerToResend) {
				const ttws = tws.randomCrewMember();
				return ttws.trysend({
					event: 'correctAnswer',
					answer: answerToResend,
				});
			}
		});
		break;
	}
	case 'whirlpoolFiveTapsDetected': {
		tws.crew().whirlpool.taps += 5;
		console.log({
			event: 'whirlpoolBonusReceived',
			amount: tws.crew().whirlpool.taps * 1000 / 2 / 5,
		});
		tws.crew().whirlpool.stressedPerson.trysend({
			event: 'whirlpoolBonusReceived',
			amount: tws.crew().whirlpool.taps * 1000 / 2 / 5,
		});
		break;
	}
	case 'whirlpoolAnswerSelected': {
		if (m.answer === tws.crew().whirlpool.question.correctAnswer) {
			tws.crew().whirlpool = { present: false, question: null };
			tws.trysend({ event: 'whirlpoolConclusion', wasCorrect: true });
			tws.sendToGameHost({
				event: 'whirlpoolStatusChanged',
				status: 'correctAnswer',
				crewNumber: tws.crewNumber,
			});
		}	else {
			tws.crew().whirlpool = { present: false, question: null };
			tws.trysend({ event: 'whirlpoolConclusion', wasCorrect: false });
			tws.sendToGameHost({
				event: 'whirlpoolStatusChanged',
				status: 'wrongAnswer',
				crewNumber: tws.crewNumber,
			});
		}
		break;
	}
	case 'rockHit': {
		tws.crew().rock = false;
		break;
	}
	default: {
		tws.error(`Unknown socket event ${m.event} received.`);
	}
	}
};
