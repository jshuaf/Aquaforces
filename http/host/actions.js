export const POPULATE_QUESTION_SET_LIST = 'POPULATE_QUESTION_SET_LIST';
export const UPDATE_SELECTED_SET = 'UPDATE_SELECTED_SET';
export const NEW_GAME = 'NEW_GAME';
export const SET_GAME_ID = 'SET_GAME_ID';
export const ADD_USER_TO_GAME = 'ADD_USER_TO_GAME';

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
export const updateSelectedSet = makeActionCreator(UPDATE_SELECTED_SET, 'selectedSet');
export const newGame = makeActionCreator(NEW_GAME);
export const setGameID = makeActionCreator(SET_GAME_ID, 'gameID');
export const addUserToGame = makeActionCreator(ADD_USER_TO_GAME, 'username');
