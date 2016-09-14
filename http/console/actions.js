export const ADD_QUESTION_INPUT = 'ADD_QUESTION_INPUT';
export const ADD_ANSWER_INPUT = 'ADD_ANSWER_INPUT';
export const EDIT_CORRECT_ANSWER = 'EDIT_CORRECT_ANSWER';
export const EDIT_INCORRECT_ANSWER = 'EDIT_INCORRECT_ANSWER';
export const EDIT_QUESTION_TEXT = 'EDIT_QUESTION_TEXT';
export const EDIT_SET_TITLE = 'EDIT_SET_TITLE';
export const TOGGLE_SET_PRIVACY = 'TOGGLE_SET_PRIVACY';

export const POPULATE_QUESTION_SET_LIST = 'POPULATE_QUESTION_SET_LIST';
export const CLEAR_NEW_QUESTION_SET = 'CLEAR_NEW_QUESTION_SET';

export const POPULATE_ACTIVE_QUESTION_SET = 'POPULATE_ACTIVE_QUESTION_SET';

export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';

export const CLEAR_REQUESTS = 'CLEAR_REQUESTS';
export const NEW_REQUEST = 'NEW_REQUEST';

export const TOGGLE_SEARCH_FILTER_SOURCE = 'TOGGLE_SEARCH_FILTER_SOURCE';

function makeActionCreator(type, ...argNames) {
	return (...args) => {
		const action = { type };
		argNames.forEach((arg, index) => {
			action[argNames[index]] = args[index];
		});
		return action;
	};
}

export const addQuestionInput = makeActionCreator(ADD_QUESTION_INPUT, 'mode');
export const addAnswerInput = makeActionCreator(ADD_ANSWER_INPUT, 'questionID', 'mode');
export const editCorrectAnswer = makeActionCreator(EDIT_CORRECT_ANSWER, 'questionID', 'text', 'mode');
export const editIncorrectAnswer = makeActionCreator(EDIT_INCORRECT_ANSWER, 'questionID', 'answerID', 'text', 'mode');
export const editQuestionText = makeActionCreator(EDIT_QUESTION_TEXT, 'questionID', 'text', 'mode');
export const editSetTitle = makeActionCreator(EDIT_SET_TITLE, 'text', 'mode');
export const toggleSetPrivacy = makeActionCreator(TOGGLE_SET_PRIVACY, 'privacy', 'mode');

export const populateQuestionSetList = makeActionCreator(POPULATE_QUESTION_SET_LIST, 'questionSets');
export const clearNewQuestionSet = makeActionCreator(CLEAR_NEW_QUESTION_SET);

export const populateActiveQuestionSet = makeActionCreator(POPULATE_ACTIVE_QUESTION_SET, 'questionSet');

export const authenticateUser = makeActionCreator(AUTHENTICATE_USER, 'user');

export const newRequest = makeActionCreator(NEW_REQUEST, 'category', 'request');
export const clearRequests = makeActionCreator(CLEAR_REQUESTS, 'category');

export const toggleSearchFilterSource = makeActionCreator(TOGGLE_SEARCH_FILTER_SOURCE, 'source');
