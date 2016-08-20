module.exports = (tws, m, games) => {
	/* eslint-disable global-require */
	require('./helpers')(tws);
	/* eslint-enable global-require */
	switch (m.event) {
	case 'newGame': {
		const id = Math.floor(Math.random() * 1e4);
		games[id] = {
			host: tws,
			crews: [],
			usernames: [],
			users: [],
			questions: [],
			hasStarted: false,
		};
				// generate random math questions
				// MARK: pull data from database
		for (let i = 0; i < 100; i++) {
			games[id].questions.push({
				text: 'What\'s ' + i + ' + ' + i + '?',
				answer: (2 * i).toString(),
				incorrectAnswers: [i.toString(), i.toString() + i.toString(),
							(3 * i).toString(), (4 * i).toString()],
			});
		}

		tws.game = games[id];
		tws.trysend({ event: 'newGame', id });
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
				if (ttws.user === m.user) {
					crew.members.splice(crew.members.indexOf(ttws), 1);
					if (crew.members.length === 0) {
						tws.game.crews.splice(tws.game.crews.indexOf(crew), 1);
					}
					ttws.trysend({
						event: 'removeUserFromCrew',
					});
				}
			});
		});
		break;
	}
	case 'removeUser': {
		if (!tws.game) {
			return tws.error('Game not found.');
		}
		tws.game.users.forEach((ttws, i) => {
			if (ttws.user === m.user) {
				tws.game.users.splice(i, 1);
				tws.game.usernames.splice(i, 1);
				ttws.trysend({
					event: 'removeUserFromGame',
				});
			}
		});
		break;
	}
	case 'startGame': {
		tws.checkGameExists();
		if (tws.game.crews.length < 1) {
			return tws.error('Need more crews to begin game.', 'Tell your sailors to join a crew!');
		}
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
					crewSize,
				});
			});
		});
		tws.trysend({
			event: 'startGame',
		});
		tws.game.crews.forEach((crew) => {
			crew.members.forEach((member) => {
				const questionID = Math.floor(Math.random() * tws.game.questions.length);
				const question = tws.game.questions[questionID];
				member.crew().activeQuestions.push({
					text: question.text,
					answer: question.answer,
					owner: member,
				});
				member.trysend({
					event: 'newQuestion',
					question: question.text,
				});
				const ttws = crew.members[Math.floor(Math.random() * crew.members.length)];
				ttws.trysend({
					event: 'correctAnswer', answer: question.answer,
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
				event: 'endGame',
			});
		});
		break;
	}
	default: {
		tws.error(`Unknown socket event ${m.event} received.`);
	} }
};