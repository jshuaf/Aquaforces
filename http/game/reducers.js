import { combineReducers } from 'redux';
import * as playActions from './play/actions';
import * as boardingActions from './boarding/actions';

const initialBoardingState = {
	status: 'joiningGame',
	gameID: null,
	username: null,
	crewNumber: null,
	pending: false,
};

function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case boardingActions.JOIN_GAME_REQUEST:
	case boardingActions.JOIN_CREW_REQUEST:
		return Object.assign({}, state, {
			pending: true,
		});
	case boardingActions.JOIN_GAME_SUCCESS:
		return Object.assign({}, state, action, {
			pending: false,
			status: 'joiningCrew',
			type: undefined,
		});
	case boardingActions.JOIN_CREW_SUCCESS:
		return Object.assign({}, state, action, {
			pending: false,
			status: 'joined',
			type: undefined,
		});
	case boardingActions.START_GAME:
		return Object.assign({}, state, {
			status: 'started',
		});
	case boardingActions.STOP_PENDING:
		return Object.assign({}, state, {
			pending: false,
		});
	default:
		return state;
	}
}

const initialGameState = {
	username: null,
	answers: [],
	crewSize: null,
	crewNumber: null,
};

function game(state = initialGameState, action) {
	switch (action.type) {
	case boardingActions.POPULATE_INITIAL_GAME_DATA:
		return Object.assign({}, state, action, {
			type: undefined,
		});
	default:
		return state;
	}
}

const gameReducer = combineReducers({ boarding, game });
export default gameReducer;
