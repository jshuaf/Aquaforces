import * as actions from './actions';

function questionSets(state = [], action) {
	switch (action.type) {
	case actions.POPULATE_QUESTION_SET_LIST:
		return action.questionSets;
	default:
		return state;
	}
}

function gameStatus(state = 'notStarted', action) {
	switch (action.type) {
	case actions.NEW_GAME:
		return 'boarding';
	default:
		return state;
	}
}

const initialOnboardingState = {
	selectedSet: null,
};

function onboarding(state = initialOnboardingState, action) {
	switch (action.type) {
	case actions.UPDATE_SELECTED_SET:
		return Object.assign({}, state, {
			selectedSet: action.selectedSet,
		});
	default:
		return state;
	}
}

export default function gameHostReducer(state = {}, action) {
	return {
		questionSets: questionSets(state.questionSets, action),
		gameStatus: gameStatus(state.gameStatus, action),
		onboarding: onboarding(state.onboarding, action),
	};
}
