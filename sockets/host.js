/* global dbcs:true */
const o = require('yield-yield'
);
module.exports = o(function* (tws, m, games) {
	/* eslint-disable global-require */
	require('./helpers')(tws);
	/* eslint-enable global-require */
	switch (m.event) {
	case 'newGame': {
		// Validate the selected set
		if (!m.set) return tws.error('No set provided in request.');
		else if (!m.set._id) return tws.error('No set ID provided in request.');

		const qset = yield dbcs.qsets.findOne({ _id: m.set._id }, yield);
		if (!qset) return tws.error('Requested set not found.');
		// Generate the answer pool (all answers, correct and incorrect)
		const answers = [];
		qset.questions.forEach((question) => {
			if (!answers.includes(question.correctAnswer)) {
				answers.push(question.correctAnswer);
			}
			for (const answer of question.incorrectAnswers) {
				if (!answers.includes(answer.text)) answers.push(answer.text);
			}
		});

		// Create the game
		const id = 1000 + Math.floor(Math.random() * 8999);
		games[id] = {
			host: tws,
			crews: [],
			users: [],
			title: qset.title,
			questions: qset.questions,
			answers,
			hasStarted: false,
		};
		tws.game = games[id];
		tws.trysend({ event: 'newGameID', id });
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
				ttws.trysend({
					event: 'removeUserFromGame',
				});
			}
		});
		break;
	}
	case 'startGame': {
		tws.checkGameExists();
		if (Object.keys(tws.game.crews).length < 1) {
			return tws.error('Need more crews to begin game.', 'Tell your sailors to join a crew!');
		}
		/* eslint-disable no-restricted-syntax */
		for (const crewNumber in tws.game.crews) {
			if ({}.hasOwnProperty.call(tws.game.crews, crewNumber)) {
				const crew = tws.game.crews[crewNumber];
				if (crew.members.length < 2) return tws.error(`Crew ${crewNumber} must have at least two people.`);
				else if (crew.members.length > 4) return tws.error(`Crew ${crewNumber} can have at most four people.`);
			}
		}
		tws.game.hasStarted = true;
		const plainCrews = {};
		for (const crewNumber in tws.game.crews) {
			if ({}.hasOwnProperty.call(tws.game.crews, crewNumber)) {
				const crew = tws.game.crews[crewNumber];
				const plainMembers = [];
				crew.members.forEach((ttws) => {
					ttws.trysend({
						event: 'startGame',
						username: ttws.username,
						answers: tws.game.answers,
						crewSize: crew.members.length,
						crewNumber: ttws.crewNumber,
					});
					plainMembers.push(ttws.username);
				});
				plainCrews[crewNumber] = plainMembers;
			}
		}
		/* eslint-enable no-restricted-syntax */
		tws.trysend({
			event: 'startGame',
			crews: plainCrews,
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
});
