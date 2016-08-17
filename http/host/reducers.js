import { ADD_QUESTION_INPUT, ADD_ANSWER_INPUT } from './actions';

function newQuestionSet(state = [], action) {
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
	case ADD_ANSWER_INPUT:
		return Object.assign({}, state, {
			questions: state.questions.map((question) => {
				if (question.id === action.questionID) {
					return Object.assign({}, question, {
						incorrectAnswers: [...question.incorrectAnswers, null],
					});
				}
				return question;
			}),
		});
	default:
		return state;
	}
}

export default function questionConsoleReducer(state = {}, action) {
	return {
		newQuestionSet: newQuestionSet(state.newQuestionSet, action),
	};
}
