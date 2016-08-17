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
	case actions.EDIT_CORRECT_ANSWER:
		return Object.assign({}, state, {
			questions: state.questions.map((question) => {
				if (question.id === action.questionID) {
					return Object.assign({}, question, {
						correctAnswer: action.text,
					});
				}
				return question;
			}),
		});
	case actions.EDIT_INCORRECT_ANSWER:
		return Object.assign({}, state, {
			questions: state.questions.map((question) => {
				if (question.id === action.questionID) {
					return Object.assign({}, question, {
						incorrectAnswers: question.incorrectAnswers.map((incorrectAnswer) => {
							if (incorrectAnswer.id === action.answerID) {
								return Object.assign({}, incorrectAnswer, {
									text: action.text,
								});
							}
							return incorrectAnswer;
						}),
					});
				}
				return question;
			}),
		});
	case actions.EDIT_QUESTION_TEXT:
		return Object.assign({}, state, {
			questions: state.questions.map((question) => {
				if (question.id === action.questionID) {
					return Object.assign({}, question, {
						text: action.text,
					});
				}
				return question;
			}),
		});
	case actions.EDIT_SET_TITLE:
		return Object.assign({}, state, {
			title: action.text,
		});
	case actions.TOGGLE_SET_PRIVACY:
		return Object.assign({}, state, {
			privacy: action.private,
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
