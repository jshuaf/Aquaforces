import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Game from './Game.jsx';
import gameReducer from './reducers';
import { joinGameSuccess, joinCrewSuccess, populateInitialGameData } from './boarding/actions';

/* global sweetAlert: true */

const store = createStore(gameReducer, window.devToolsExtension && window.devToolsExtension());

const socketProtocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
const socketPort = location.port !== 80 ? `:${location.port}` : '';
const socket = new WebSocket(`${socketProtocol}${location.hostname}${socketPort}/play/`);

socket.onmessage = function (m) {
	let message;
	try {
		message = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
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
		break;
	case 'answerSelected':
		if (m.wasCorrectAnswer) {
			game.correctAnswer(m.answer);
		} else {
			game.incorrectAnswer(m.answer);
		}
		break;
	case 'updateHP':
		game.updateHP(m.hp);
		break;
	case 'addRock':
		game.addRock(m.startTime);
		break;
	case 'endRock':
		game.endRock();
		break;
	case 'whirlpoolAhead':
		game.addWhirlpoolTap();
		break;
	case 'whirlpoolQuestion':
		game.addWhirlpoolQuestion(m.question);
		break;
	case 'whirlpoolBonusReceived':
		console.log('Bonus received');
		game.setState({ whirlpoolBonus: m.amount });
		break;
	case 'whirlpoolConclusion':
		game.setState({ whirlpool: false });
		game.state.whirlpoolTimebar.reset();
		break;
	case 'correctAnswer':
		game.addCorrectAnswer(m.answer);
		break;
	case 'newQuestion':
		game.newQuestion(m.question);
		break;
	case 'endGame':
		gameHasEnded = true;
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

render(
	<Provider store={store}>
		<Game socket={socket} />
	</Provider>,
	document.getElementById('mountNode'));

/*
const cont = document.getElementById('cont');
let gameHasEnded = false;
let answers = [];

let game;
let username;
let crewNumber;

function setState(id) {
	cont.children.forEach((e) => {
		if (e.id !== id) {
			e.hidden = true;
		}
	});
	document.getElementById(id).hidden = false;
	// if filling out form, automatically focus
	// to the next input field
	const e = document.getElementById(id).getElementsByTagName('input');
	if (e.length) e[0].focus();
}

function setupGameEnvironment() {
	document.getElementById('content').hidden = true;
	document.body.style.cssText =
		'background: #32c0cf repeat-x center top; background-size: cover;';
}

function confirmMessageRecieved() {
	socket.send(JSON.stringify({ event: 'messageRecieved' }));
}

socket.onmessage = function (m) {
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return sweetAlert('Socket error.');
	}

	confirmMessageRecieved();

	switch (m.event) {
	case 'ping':
		break;
	case 'notice':
		errorEl.textContent = m.body;
		errorEl.scrollIntoView();
		break;
	case 'error':
		document.getElementById('joinCrewButton').disabled = false;
		document.getElementById('joinGameButton').disabled = false;
		sweetAlert(m.title, m.text, 'error');
		break;
	case 'addUser':
		setState('crew');
		break;
	case 'addUserToCrew':
		document.getElementById('crewnodisplay').textContent =
			parseInt(document.getElementById('crewno').value, 10);
		crewNumber = parseInt(document.getElementById('crewno').value, 10);
		setState('wait');
		break;
	case 'removeUserFromCrew':
		setState('crew');
		break;
	case 'removeUserFromGame':
		setState('join');
		break;
	case 'startGame':
		setState('mountNode');
		setupGameEnvironment();
		answers = m.answers;
		game = ReactDOM.render(<Game
  socket={socket} username={username}
  crewNumber={crewNumber} answerData={m.answers}
  crewSize={m.crewSize}
  />,
			document.getElementById('mountNode'));
		break;
	case 'answerSelected':
		if (m.wasCorrectAnswer) {
			game.correctAnswer(m.answer);
		} else {
			game.incorrectAnswer(m.answer);
		}
		break;
	case 'updateHP':
		game.updateHP(m.hp);
		break;
	case 'addRock':
		game.addRock(m.startTime);
		break;
	case 'endRock':
		game.endRock();
		break;
	case 'whirlpoolAhead':
		game.addWhirlpoolTap();
		break;
	case 'whirlpoolQuestion':
		game.addWhirlpoolQuestion(m.question);
		break;
	case 'whirlpoolBonusReceived':
		console.log('Bonus received');
		game.setState({ whirlpoolBonus: m.amount });
		break;
	case 'whirlpoolConclusion':
		game.setState({ whirlpool: false });
		game.state.whirlpoolTimebar.reset();
		break;
	case 'correctAnswer':
		game.addCorrectAnswer(m.answer);
		break;
	case 'newQuestion':
		game.newQuestion(m.question);
		break;
	case 'endGame':
		gameHasEnded = true;
		break;
	default:
		console.log('Game recieved unknown event: ', m.event);
		break;
	}
};

socket.onclose = () => {
	sweetAlert('Server connection died.', "We're sorry about that.", 'error');
};
document.getElementById('join').addEventListener('submit', (e) => {
	e.preventDefault();
	document.getElementById('joinGameButton').disabled = true;
	socket.send(JSON.stringify({
		event: 'addUser',
		code: parseInt(document.getElementById('game-code').value, 10),
		name: document.getElementById('crewmember-name').value,
	}));
	username = document.getElementById('crewmember-name').value;
});

document.getElementById('crew').addEventListener('submit', (e) => {
	document.getElementById('joinCrewButton').disabled = true;
	e.preventDefault();
	socket.send(JSON.stringify({
		event: 'addUserToCrew',
		crewNumber: parseInt(document.getElementById('crewno').value, 10),
	}));
});*/
