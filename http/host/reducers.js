import { ADD_QUESTION_INPUT } from './actions';

function questionSets(state = [], action) {
	switch (action.type) {
	case ADD_QUESTION_INPUT:
		return Object.assign({}, state, {
			questions: [
				...state.questions,
				{
					text: null,
					correctAnswer: null,
					incorrectAnswers: [],
				},
			],
		});
	default:
		return state;
	}
}

export default function questionConsoleReducer(state = {}, action) {
	return {
		questionSets: questionSets(state.questionSets, action),
	};
}
