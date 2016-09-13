import { render } from 'react-dom';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import GameHost from './GameHost.jsx';
import {
	setGameID, addUserToGame, addUserToCrew,
	removeUserFromGame, startGameSuccess, populateInitialCrewData, stopPending } from './actions';
import gameHostReducer from './reducers';

/* global sweetAlert: true */

const store = createStore(gameHostReducer, undefined, compose(
	applyMiddleware(thunk),
	window.devToolsExtension && window.devToolsExtension())
);

const socketProtocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
const socketPort = location.port !== 80 ? `:${location.port}` : '';
const socket = new WebSocket(`${socketProtocol}${location.hostname}${socketPort}/host/`);

let host;

render(
	<Provider store={store}>
		<GameHost socket={socket} instance={(ref) => { if (ref) host = ref.getWrappedInstance(); }} />
	</Provider>,
	document.getElementById('mountNode'));

socket.onmessage = function (m) {
	let message;
	try {
		message = JSON.parse(m.data);
	} catch (e) {
		console.error(e);
		return sweetAlert('Socket error.', 'error');
	}

	switch (message.event) {
	case 'error':
		store.dispatch(stopPending());
		return sweetAlert(message.title, message.text, 'error');
	case 'newGameID':
		document.getElementsByTagName('title')[0].innerHTML = `Game ${message.id} · Aquaforces`;
		return store.dispatch(setGameID(message.id));
	case 'addUserToGame':
		return store.dispatch(addUserToGame(message.username));
	case 'addUserToCrew':
		return store.dispatch(addUserToCrew(message.username, message.crewNumber));
	case 'removeUserFromGame':
		return store.dispatch(removeUserFromGame(message.username));
	case 'startGame':
		store.dispatch(populateInitialCrewData(message.crews));
		return store.dispatch(startGameSuccess());
	case 'answerSelected':
		host.answerSelected(message.wasCorrectAnswer, message.crewNumber);
		break;
	case 'whirlpoolStatusChanged':
		host.whirlpoolStatusChanged(message.status, message.crewNumber);
		break;
	default:
		console.error('Unknown message: ', message.event);
		return;
	}
};

socket.onclose = function (m) {
	sweetAlert('Socket closed', null, 'error');
	console.error(m);
};
