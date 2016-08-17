export const ADD_QUESTION_INPUT = 'ADD_QUESTION_INPUT';
export const ADD_ANSWER_INPUT = 'ADD_ANSWER_INPUT';
export const EDIT_CORRECT_ANSWER = 'EDIT_CORRECT_ANSWER';
export const EDIT_INCORRECT_ANSWER = 'EDIT_INCORRECT_ANSWER';
export const EDIT_QUESTION_TEXT = 'EDIT_QUESTION_TEXT';
export const EDIT_SET_TITLE = 'EDIT_SET_TITLE';
export const TOGGLE_SET_PRIVACY = 'TOGGLE_SET_PRIVACY';

function makeActionCreator(type, ...argNames) {
	return (...args) => {
		const action = { type };
		argNames.forEach((arg, index) => {
			action[argNames[index]] = args[index];
		});
		return action;
	};
}

export const addQuestionInput = makeActionCreator(ADD_QUESTION_INPUT);
export const addAnswerInput = makeActionCreator(ADD_ANSWER_INPUT, 'questionID');
export const editCorrectAnswer = makeActionCreator(EDIT_CORRECT_ANSWER, 'questionID', 'text');
export const editIncorrectAnswer = makeActionCreator(EDIT_INCORRECT_ANSWER, 'questionID', 'answerID', 'text');
export const editQuestionText = makeActionCreator(EDIT_QUESTION_TEXT, 'questionID', 'text');
export const editSetTitle = makeActionCreator(EDIT_SET_TITLE, 'text');
export const toggleSetPrivacy = makeActionCreator(TOGGLE_SET_PRIVACY, 'private');
