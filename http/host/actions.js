export const POPULATE_QUESTION_SET_LIST = 'POPULATE_QUESTION_SET_LIST';
export const UPDATE_SELECTED_SET = 'UPDATE_SELECTED_SET';
export const NEW_GAME = 'NEW_GAME';
export const SET_GAME_ID = 'SET_GAME_ID';
export const ADD_USER_TO_GAME = 'ADD_USER_TO_GAME';
export const ADD_USER_TO_CREW = 'ADD_USER_TO_CREW';
export const REMOVE_USER_FROM_GAME = 'REMOVE_USER_FROM_GAME';
export const START_GAME_REQUEST = 'START_GAME_REQUEST';
export const START_GAME_SUCCESS = 'START_GAME_SUCCESS';

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
export const addUserToCrew = makeActionCreator(ADD_USER_TO_CREW, 'username', 'crewNumber');
export const removeUserFromGame = makeActionCreator(REMOVE_USER_FROM_GAME, 'username');
export const startGameRequest = makeActionCreator(START_GAME_REQUEST);
export const startGameSuccess = makeActionCreator(START_GAME_SUCCESS);
