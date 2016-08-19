export const POPULATE_QUESTION_SET_LIST = 'POPULATE_QUESTION_SET_LIST';
export const NEW_GAME = 'NEW_GAME';

function makeActionCreator(type, ...argNames) {
	return (...args) => {
		const action = { type };
		argNames.forEach((arg, index) => {
			action[argNames[index]] = args[index];
		});
		return action;
	};
}

export const populateQuestionSetList = makeActionCreator(POPULATE_QUESTION_SET_LIST, 'questionSets');
export const newGame = makeActionCreator(NEW_GAME);
