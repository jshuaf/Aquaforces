/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!****************************!*\
  !*** ./http/game/game.jsx ***!
  \****************************/
/***/ function(module, exports) {

	'use strict';
	
	var socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/play/');
	var cont = document.getElementById('cont');
	var gameHasEnded = false;
	var answers = [];
	
	var game = void 0;
	var username = void 0;
	var crewNumber = void 0;
	
	function setState(id) {
		cont.children.forEach(function (e) {
			if (e.id !== id) {
				e.hidden = true;
			}
		});
		document.getElementById(id).hidden = false;
		// if filling out form, automatically focus
		// to the next input field
		var e = document.getElementById(id).getElementsByTagName('input');
		if (e.length) e[0].focus();
	}
	
	function setupGameEnvironment() {
		document.getElementById('content').hidden = true;
		document.body.style.cssText = 'background: #32c0cf repeat-x center top; background-size: cover;';
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
				sweetAlert(m.title, m.text, "error");
				break;
			case 'addUser':
				setState('crew');
				break;
			case 'addUserToCrew':
				document.getElementById('crewnodisplay').textContent = parseInt(document.getElementById('crewno').value, 10);
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
				game = ReactDOM.render(React.createElement(Game, {
					socket: socket, username: username,
					crewNumber: crewNumber, answerData: m.answers,
					crewSize: m.crewSize
				}), document.getElementById('mountNode'));
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
	
	socket.onclose = function () {
		sweetAlert("Server connection died.", "We're sorry about that.", "error");
	};
	document.getElementById('join').addEventListener('submit', function (e) {
		e.preventDefault();
		document.getElementById('joinGameButton').disabled = true;
		socket.send(JSON.stringify({
			event: 'addUser',
			code: parseInt(document.getElementById('game-code').value, 10),
			name: document.getElementById('crewmember-name').value
		}));
		username = document.getElementById('crewmember-name').value;
	});
	
	document.getElementById('crew').addEventListener('submit', function (e) {
		document.getElementById('joinCrewButton').disabled = true;
		e.preventDefault();
		socket.send(JSON.stringify({
			event: 'addUserToCrew',
			crewNumber: parseInt(document.getElementById('crewno').value, 10)
		}));
	});

/***/ }
/******/ ]);
//# sourceMappingURL=game.bundle.js.map