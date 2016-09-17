import { combineReducers } from 'redux';
import undoable from 'redux-undo';
import * as actions from './actions';

const initialNewSetState = {
	title: '',
	nextQuestionID: 2,
	questions: [{
		text: '',
		correctAnswer: '',
		incorrectAnswers: [{
			text: '',
			id: 1,
		}],
		id: 1,
		nextAnswerID: 2,
	}],
	privacy: false,
};

function newQuestionSet(state = initialNewSetState, action) {
	if (action.mode === 'create') {
		switch (action.type) {
		case actions.ADD_QUESTION_INPUT:
			return Object.assign({}, state, {
				questions: [
					...state.questions,
					{
						text: '',
						correctAnswer: '',
						incorrectAnswers: [{
							text: '',
							id: 1,
						}],
						id: state.nextQuestionID,
						nextAnswerID: 2,
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
				privacy: action.privacy,
			});
		default:
		}
	}
	switch (action.type) {
	case actions.CLEAR_NEW_QUESTION_SET:
		return initialNewSetState;
	default:
		return state;
	}
}

function questionSets(state = [], action) {
	switch (action.type) {
	case actions.POPULATE_QUESTION_SET_LIST:
		return action.questionSets || state;
	default:
		return state;
	}
}

const initialQuestionSetState = Object.assign(initialNewSetState, { _id: '', shortID: '' });

function activeQuestionSet(state = initialQuestionSetState, action) {
	if (action.mode === 'edit') {
		switch (action.type) {
		case actions.ADD_QUESTION_INPUT:
			return Object.assign({}, state, {
				questions: [
					...state.questions,
					{
						text: '',
						correctAnswer: '',
						incorrectAnswers: [{
							text: '',
							id: 1,
						}],
						id: state.nextQuestionID,
						nextAnswerID: 2,
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
				privacy: action.privacy,
			});
		case actions.DELETE_QUESTION: {
			const questionToRemove = state.questions.filter((x) => x.id === action.id)[0];
			const questionIndex = state.questions.indexOf(questionToRemove);
			const newQuestions = state.questions.slice();
			newQuestions.splice(questionIndex, 1);
			return Object.assign({}, state, {
				questions: newQuestions,
			});
		}
		default:
		}
	}
	switch (action.type) {
	case actions.POPULATE_ACTIVE_QUESTION_SET:
		return action.questionSet || state;
	default:
		return state;
	}
}

function currentUser(state = null, action) {
	switch (action.type) {
	case actions.AUTHENTICATE_USER:
		return action.user || state;
	default:
		return state;
	}
}

const initialRequestsState = {
	search: [],
};

function requests(state = initialRequestsState, action) {
	switch (action.type) {
	case actions.NEW_REQUEST:
		if (!state[action.category]) {
			return Object.assign({}, state, {
				[action.category]: [action.request],
			});
		}
		return Object.assign({}, state, {
			[action.category]: state[action.category].concat(action.request),
		});
	case actions.CLEAR_REQUESTS:
		return Object.assign({}, state, {
			[action.category]: [],
		});
	default:
		return state;
	}
}

const initialSearchFilterState = {
	sources: ['quizlet', 'aquaforces'],
};

function searchFilter(state = initialSearchFilterState, action) {
	switch (action.type) {
	case actions.TOGGLE_SEARCH_FILTER_SOURCE: {
		let newSources = state.sources.slice();
		if (newSources.indexOf(action.source) >= 0) {
			newSources.splice(newSources.indexOf(action.source), 1);
		} else {
			newSources = newSources.concat([action.source]);
		}
		return Object.assign({}, state, { sources: newSources });
	}
	default:
		return state;
	}
}

function editingQuestionSet(state = {}, action) {
	switch (action.type) {
	default:
		return state;
	}
}

const questionConsoleReducer = combineReducers({
	newQuestionSet, questionSets, activeQuestionSet: undoable(activeQuestionSet), currentUser, requests, searchFilter, editingQuestionSet,
});
export default questionConsoleReducer;
