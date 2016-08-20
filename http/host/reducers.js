import * as actions from './actions';

function questionSets(state = [], action) {
	switch (action.type) {
	case actions.POPULATE_QUESTION_SET_LIST:
		return action.questionSets;
	default:
		return state;
	}
}

const initialGameInfoState = {
	status: 'notStarted',
	id: null,
};
function gameInfo(state = initialGameInfoState, action) {
	switch (action.type) {
	case actions.NEW_GAME:
		return Object.assign({}, state, {
			status: 'boarding',
		});
	case actions.SET_GAME_ID:
		return Object.assign({}, state, {
			id: action.id,
		});
	default:
		return state;
	}
}

const initialBoardingState = {
	selectedSet: null,
};

function boarding(state = initialBoardingState, action) {
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
		gameInfo: gameInfo(state.gameInfo, action),
		boarding: boarding(state.boarding, action),
	};
}
