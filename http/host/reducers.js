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
	gameID: null,
};
function gameInfo(state = initialGameInfoState, action) {
	switch (action.type) {
	case actions.NEW_GAME:
		return Object.assign({}, state, {
			status: 'boarding',
		});
	case actions.SET_GAME_ID:
		return Object.assign({}, state, {
			gameID: action.gameID,
		});
	case actions.START_GAME:
		return Object.assign({}, state, {
			status: 'inProgress',
		});
	default:
		return state;
	}
}

const initialBoardingState = {
	selectedSet: null,
	usersWithoutCrews: [],
	crews: {},
};

function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case actions.UPDATE_SELECTED_SET:
		return Object.assign({}, state, {
			selectedSet: action.selectedSet,
		});
	case actions.ADD_USER_TO_GAME:
		return Object.assign({}, state, {
			usersWithoutCrews: state.usersWithoutCrews.concat(action.username),
		});
	case actions.ADD_USER_TO_CREW: {
		const oldUserIndex = state.usersWithoutCrews.indexOf(action.username);
		return Object.assign({}, state, {
			usersWithoutCrews: state.usersWithoutCrews.splice(oldUserIndex, 1),
			crews: Object.assign({}, state.crews, {
				[action.crewNumber]:
					state.crews[action.crewNumber] ?
					state.crews[action.crewNumber].concat(action.username) :
					[action.username],
			}),
		});
	}
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
