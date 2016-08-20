import * as actions from './play/actions';

const initialBoardingState = {
	status: 'joiningGame',
	id: null,
	username: null,
};
function boarding(state = initialBoardingState, action) {
	switch (action.type) {
	case actions.JOIN_GAME:
		return Object.assign({}, state, {
			status: 'joiningCrew',
			id: action.id,
			username: action.username,
		});
	default:
		return state;
	}
}

export default function gameHostReducer(state = {}, action) {
	return {
		boarding: boarding(state.boardingStatus, action),
	};
}
