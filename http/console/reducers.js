import { combineReducers } from 'redux';
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
		return state;
	}
}

function questionSets(state = [], action) {
	switch (action.type) {
	case actions.POPULATE_QUESTION_SET_LIST:
		return action.questionSets || state;
	case actions.ADD_SET:
		return state.concat(action.set);
	case actions.DELETE_SET:
		return state.filter((questionSet) =>
			questionSet._id !== action.id
		);
	default:
		return state;
	}
}

const initialQuestionSetState = Object.assign(initialNewSetState, { _id: '', shortID: '' });

function activeQuestionSet(state = initialQuestionSetState, action) {
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

function requests(state = {}, action) {
	switch (action.type) {
	case actions.NEW_SEARCH_REQUEST:
		if (!state.search) {
			return Object.assign({}, state, {
				search: action.request,
			});
		}
		return Object.assign({}, state, {
			search: state.search.concat(action.request),
		});
	case actions.CLEAR_SEARCH_REQUESTS:
		return Object.assign({}, state, {
			search: [],
		});
	default:
		return state;
	}
}

const questionConsoleReducer = combineReducers({
	newQuestionSet, questionSets, activeQuestionSet, currentUser, requests });
export default questionConsoleReducer;
