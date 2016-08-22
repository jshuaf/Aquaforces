import * as playActions from './play/actions';
import * as boardingActions from './boarding/actions';

const initialBoardingState = {
	status: 'joiningGame',
	gameID: null,
	username: null,
	crewNumber: null,
	pendingRequest: false,
};

function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case boardingActions.JOIN_GAME_REQUEST:
	case boardingActions.JOIN_CREW_REQUEST:
		return Object.assign({}, state, {
			pendingRequest: true,
		});
	case boardingActions.JOIN_GAME_SUCCESS:
		delete action.type;
		return Object.assign({}, state, action, {
			pendingRequest: false,
			status: 'joiningCrew',
		});
	case boardingActions.JOIN_CREW_SUCCESS:
		delete action.type;
		return Object.assign({}, state, action, {
			pendingRequest: false,
			status: 'joined',
		});
	default:
		return state;
	}
}

export default function gameReducer(state = {}, action) {
	return {
		boarding: boarding(state.boardingStatus, action),
	};
}
