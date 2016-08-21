import * as actions from './play/actions';

const initialBoardingState = {
	status: 'joiningGame',
	id: null,
	username: null,
	pendingRequest: false,
};

function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case actions.JOIN_GAME_REQUEST:
		return Object.assign({}, state, {
			pendingRequest: true,
		});
	case actions.JOIN_GAME_SUCCESS:
		delete action.type;
		return Object.assign({}, state, action, {
			pendingRequest: false,
			status: 'joiningCrew',
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
