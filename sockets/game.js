module.exports = (tws, m, games) => {
	/* eslint-disable global-require */
	require('./helpers')(tws);
	/* eslint-enable global-require */

	const maxFuzzyTime = 3000;

	switch (m.event) {
	case 'joinGame': {
		const game = games[m.gameID];
		if (!game) return tws.error('Invalid game code.', 'Make sure you type it correctly!');
		tws.game = game;
		if (!m.username) {
			return tws.error('You must enter a username.', 'Be creative!');
		} else if (m.username.length > 24) {
			return tws.error('You must enter a username less than 24 characters.');
		} else if (tws.usernames().includes(m.username)) {
			return tws.error('Your username has been taken', 'Be quicker next time.');
		} else if (game.hasStarted) {
			return tws.error('Game has started.', 'Jump in next time!');
		}
		tws.username = m.username;
		tws.questionsDone = [];
		tws.game.users.push(tws);
		tws.sendToGameHost({
			event: 'addUserToGame',
			username: tws.username,
		});
		return tws.trysend(m);
	}
	case 'joinCrew': {
		tws.checkGameExists();
		if (!m.crewNumber || isNaN(m.crewNumber)) {
			return tws.error('You must enter a crew number.');
		} else if (typeof m.crewNumber !== 'number') {
			m.crewNumber = +m.crewNumber;
		}
		if (!(m.crewNumber <= 12 && m.crewNumber >= 1)) {
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
		} else {
			tws.game.crews[m.crewNumber].members.push(tws);
		}
		tws.crewNumber = m.crewNumber;
		tws.sendToGameHost({
			event: 'addUserToCrew',
			username: tws.username,
			crewNumber: m.crewNumber,
		});
		return tws.trysend(m);
	}
	case 'answerSelected': {
		tws.checkGameExists();

		if (Math.random() < 0.001 * tws.crew().streak) {
			tws.crew().streak = 0;
			if (Math.random() < 0) {
				tws.addWhirlpool();
			} else {
				tws.addRock();
			}
		}
		if (!m.answer) return tws.error('No answer text sent.');
		const crew = tws.crew();

		// Fuzzy answer checking
		crew.recentCorrectAnswers.forEach((pastAnswer) => {
			if (Date.now() - pastAnswer.timeAdded < maxFuzzyTime) {
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
			if (activeQuestion.correctAnswer === m.answer) {
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
				tws.crew().recentCorrectAnswers.push({
					text: correspondingQuestion.correctAnswer,
					timeAdded: Date.now(),
				});
				correspondingQuestion.owner.addNewQuestion();
			}
		});
		if (!correspondingQuestion) {
			// Answer selected was incorrect
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

		let correspondingQuestion;
		tws.crew().activeQuestions.forEach((activeQuestion) => {
			if (activeQuestion.text === m.question) {
				correspondingQuestion = activeQuestion;
				tws.crew().activeQuestions.splice(
					tws.crew().activeQuestions.indexOf(correspondingQuestion), 1);
				tws.crew().streak = 0;
				return correspondingQuestion.owner.addNewQuestion();
			}
		});
		if (!correspondingQuestion) {
			tws.error('Unknown question timed out.');
		}
		break;
	}
	case 'resendAnswer': {
		tws.checkGameExists();
		if (typeof m.text !== 'string') {
			return tws.error('No answer text sent.');
		}
		const ttws = tws.randomCrewMember();
		ttws.trysend({
			event: 'correctAnswer',
			answer: m.answer,
		});
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
