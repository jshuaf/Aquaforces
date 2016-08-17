import * as actions from './actions';

const initialQuestionSetState = {
	title: '', nextQuestionID: 1, questions: [], privacy: false,
};

function newQuestionSet(state = initialQuestionSetState, action) {
	switch (action.type) {
	case actions.ADD_QUESTION_INPUT:
		return Object.assign({}, state, {
			questions: [
				...state.questions,
				{
					text: '',
					correctAnswer: '',
					incorrectAnswers: [],
					id: state.nextQuestionID,
					nextAnswerID: 1,
				},
			],
			nextQuestionID: state.nextQuestionID + 1,
		});
	case actions.ADD_ANSWER_INPUT:
		return Object.assign({}, state, {
			questions: state.questions.map((question) => {
				if (question.id === action.questionID) {
					return Object.assign({}, question, {
						incorrectAnswers: [...question.incorrectAnswers, {
							text: '',
							id: question.nextAnswerID,
						}],
						nextAnswerID: question.nextAnswerID + 1,
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
