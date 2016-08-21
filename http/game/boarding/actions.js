export const JOIN_GAME_REQUEST = 'JOIN_GAME_REQUEST';
export const JOIN_GAME_SUCCESS = 'JOIN_GAME_SUCCESS';

function makeActionCreator(type, ...argNames) {
	return (...args) => {
		const action = { type };
		argNames.forEach((arg, index) => {
			action[argNames[index]] = args[index];
		});
		return action;
	};
}

export const joinGameRequest = makeActionCreator(JOIN_GAME_REQUEST);
export const joinGameSuccess = makeActionCreator(JOIN_GAME_SUCCESS, 'id', 'username');