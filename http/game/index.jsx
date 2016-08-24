import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Game from './Game.jsx';
import gameReducer from './reducers';
import { joinGameSuccess, joinCrewSuccess, populateInitialGameData, startGame } from './boarding/actions';

/* global sweetAlert: true */

const store = createStore(gameReducer, window.devToolsExtension && window.devToolsExtension());

const socketProtocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
const socketPort = location.port !== 80 ? `:${location.port}` : '';
const socket = new WebSocket(`${socketProtocol}${location.hostname}${socketPort}/play/`);

let game;

render(
	<Provider store={store}>
		<Game socket={socket} instance={(ref) => { if (ref) game = ref.getWrappedInstance(); }} />
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
		return sweetAlert(message.title, message.text, 'error');
	case 'joinGame':
		return store.dispatch(joinGameSuccess(message.gameID, message.username));
	case 'joinCrew':
		document.getElementsByTagName('title')[0].innerHTML = 'Play · Aquaforces';
		return store.dispatch(joinCrewSuccess(message.crewNumber));
	case 'startGame':
		store.dispatch(
			populateInitialGameData(message.username, message.answers, message.crewSize, message.crewNumber));
		return store.dispatch(startGame());
	case 'answerSelected':
		if (message.wasCorrectAnswer) {
			game.correctAnswer(message.answer);
		} else {
			game.incorrectAnswer(message.answer);
		}
		break;
	case 'updateHP':
		game.updateHP(message.hp);
		break;
	case 'addRock':
		game.addRock(message.startTime);
		break;
	case 'endRock':
		game.endRock();
		break;
	case 'whirlpoolAhead':
		game.addWhirlpoolTap();
		break;
	case 'whirlpoolQuestion':
		game.addWhirlpoolQuestion(message.question);
		break;
	case 'whirlpoolBonusReceived':
		game.setState({ whirlpoolBonus: message.amount });
		break;
	case 'whirlpoolConclusion':
		game.setState({ whirlpool: false });
		game.state.whirlpoolTimebar.reset();
		break;
	case 'correctAnswer':
		game.addCorrectAnswer(message.answer);
		break;
	case 'newQuestion':
		game.newQuestion(message.question);
		break;
	default:
		console.error('Unknown message: ', message);
		return;
	}
};

socket.onclose = function (m) {
	sweetAlert('Socket closed', null, 'error');
	console.error(m);
};
