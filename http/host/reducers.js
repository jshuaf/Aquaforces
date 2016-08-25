import { combineReducers } from 'redux';
import * as actions from './actions';

const initialGameInfoState = {
	status: 'notStarted',
	gameID: null,
	pending: false,
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
	case actions.START_GAME_REQUEST:
		return Object.assign({}, state, {
			pending: true,
		});
	case actions.START_GAME_SUCCESS:
		return Object.assign({}, state, {
			status: 'inProgress',
			pending: false,
		});
	case actions.STOP_PENDING:
		return Object.assign({}, state, {
			pending: false,
		});
	default:
		return state;
	}
}

const initialBoardingState = {
	questionSets: [],
	selectedSet: null,
	usersWithoutCrews: [],
	crews: {},
};

function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case actions.POPULATE_QUESTION_SET_LIST:
		return Object.assign({}, state, { questionSets: action.questionSets });
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
		const usersWithoutCrews = state.usersWithoutCrews.slice();
		usersWithoutCrews.splice(oldUserIndex, 1);
		return Object.assign({}, state, {
			usersWithoutCrews,
			crews: Object.assign({}, state.crews, {
				[action.crewNumber]:
					state.crews[action.crewNumber] ?
					state.crews[action.crewNumber].concat(action.username) :
					[action.username],
			}),
		});
	}
	case actions.REMOVE_USER_FROM_GAME: {
		const oldUserIndex = state.usersWithoutCrews.indexOf(action.username);
		if (oldUserIndex >= 0) {
			const usersWithoutCrews = state.usersWithoutCrews.slice();
			usersWithoutCrews.splice(oldUserIndex, 1);
			return Object.assign({}, state, { usersWithoutCrews });
		}
		const crews = Object.assign({}, state.crews);
		Object.keys(state.crews).forEach((crewNumber) => {
			const crew = state.crews[crewNumber].slice();
			if (crew.includes(action.username)) {
				crew.splice(crew.indexOf(action.username), 1);
			}
			if (crew.length > 0) crews[crewNumber] = crew;
		});
		return Object.assign({}, state, { crews });
	}
	default:
		return state;
	}
}

const initialGameHostState = {
	crews: {},
};

function gameHost(state = initialGameHostState, action) {
	switch (action.type) {
	case actions.POPULATE_INITIAL_CREW_DATA: {
		const crews = {};
		Object.keys(action.crews).forEach((crewNumber) => {
			const crewMembers = action.crews[crewNumber];
			crews[crewNumber] = {
				name: `Crew ${crewNumber}`,
				users: crewMembers,
				position: 0,
				status: 'rowing',
				boat: 'canoe',
			};
		});
		return Object.assign({}, state, { crews });
	}
	default:
		return state;
	}
}

const gameHostReducer = combineReducers({ gameInfo, boarding, gameHost });
export default gameHostReducer;
