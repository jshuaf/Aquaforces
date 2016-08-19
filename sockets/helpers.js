module.exports = (tws) => {
	tws.trysend = (msg) => {
		try {
			tws.send(JSON.stringify(msg));
		} catch (e) {
			console.error(e);
		}
	};

	tws.error = (title, text) =>
		tws.trysend({ event: 'error', title, text });

	tws.checkGameExists = () => {
		if (!tws.game) return tws.error('Game not found.', 'Try a different game code.');
	};

	tws.sendToGameHost = (data) =>
		tws.game.host.trysend(data);

	tws.crew = () => tws.game.crews[tws.crewNumber];

	tws.randomCrewMember = () => tws.crew().members[Math.floor(Math.random() * tws.crew().members.length)];

	tws.addWhirlpool = () => {
		tws.crew().whirlpool = { present: true, question: null, taps: 0 };
		tws.crew().whirlpool.question = tws.generateNewQuestion();
		tws.sendToGameHost({
			event: 'whirlpoolStatusChanged',
			status: 'new',
			creNumber: tws.crewNumber,
		});
		const ttws = tws.randomCrewMember();
		tws.crew().whirlpool.stressedPerson = ttws;
		tws.crew().members.forEach((crewMember) => {
			if (crewMember !== ttws) {
				crewMember.trysend({ event: 'whirlpoolAhead' });
			}
		});

		// MARK: challenge questions?
		ttws.trysend({
			event: 'whirlpoolQuestion',
			question: tws.crew().whirlpool.question,
		});
	};

	tws.addRock = () => {
		if (tws.crew().whirlpool.present) {
			return;
		}
		tws.crew().rock = {
			correctAnswers: 0,
		};
		tws.crew().members.forEach((crewMember) => {
			crewMember.trysend({
				event: 'addRock',
				startTime: (Date.now()) + 1500,
			});
		});
	};

	tws.generateNewQuestion = () => {
		let newQuestionID = 0;
		while (!newQuestionID || tws.questionsDone.includes(tws.game.questions[newQuestionID])) {
			newQuestionID = Math.floor(Math.random() * tws.game.questions.length);
		}
		return tws.game.questions[newQuestionID];
	};

	tws.addNewQuestion = () => {
		const newQuestion = tws.generateNewQuestion();
		tws.crew().activeQuestions.push({
			text: newQuestion.text,
			answer: newQuestion.answer,
			owner: tws,
		});
		tws.trysend({
			event: 'newQuestion',
			question: newQuestion.text,
		});
		const ttws = tws.crew().members[Math.floor(Math.random() * tws.crew().members.length)];
		ttws.trysend({
			event: 'correctAnswer',
			answer: newQuestion.answer,
		});
		return newQuestion;
	};

	tws.sendAnswerEvent = (wasCorrectAnswer, crewNumber, answer) => {
		tws.trysend({
			event: 'answerSelected',
			wasCorrectAnswer,
			answer,
		});
		return tws.sendToGameHost({
			event: 'answerSelected',
			crewNumber,
			wasCorrectAnswer,
		});
	};
};
