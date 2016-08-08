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
  !*** ./http/host/host.jsx ***!
  \****************************/
/***/ function(module, exports) {

	'use strict';
	
	var socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
	var cont = document.getElementById('cont');
	
	var crews = {};
	var usersWithoutCrews = [];
	
	var gameHost = void 0;
	var gameHasStarted = false;
	
	function setState(id) {
		// hide and show different elements
		cont.children.forEach(function (e) {
			if (e.id != id) e.hidden = true;
		});
		document.getElementById(id).hidden = false;
	}
	
	function removeUserFromGame() {
		var userToRemove = this.dataset.username;
		socket.send(JSON.stringify({
			event: 'removeUser',
			user: userToRemove
		}));
		this.parentNode.removeChild(this);
	
		for (var i = 0; i < usersWithoutCrews.length; i++) {
			var username = usersWithoutCrews[i];
			if (userToRemove == username) {
				usersWithoutCrews.splice(usersWithoutCrews.indexOf(username), 1);
				break;
			}
		}
	}
	
	function removeUserFromCrew() {
		if (gameHasStarted) {
			return;
		}
		socket.send(JSON.stringify({
			event: 'removeUserFromCrew',
			user: this.dataset.username
		}));
		var li = document.createElement('li');
		li.dataset.username = this.dataset.username;
		li.appendChild(document.createTextNode(this.dataset.username));
		li.onclick = removeUserFromGame;
		document.getElementById('loneusers').appendChild(li);
		this.parentNode.dataset.n--;
		this.parentNode.removeChild(this);
	
		for (var crewNumber in crews) {
			var crewmembers = crews[crewNumber].users;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;
	
			try {
				for (var _iterator = crewmembers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var crewmember = _step.value;
	
					if (crewmember == this.dataset.username) {
						crewmembers.splice(crewmembers.indexOf(crewmember), 1);
						return;
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}
	
	function confirmMessageRecieved() {
		socket.send(JSON.stringify({ event: 'messageRecieved' }));
	}
	
	socket.onmessage = function (m) {
		try {
			m = JSON.parse(m.data);
		} catch (e) {
			console.log(e);
			return sweetAlert('Socket error.', 'error');
		}
	
		confirmMessageRecieved();
	
		switch (m.event) {
			case 'ping':
				break;
			case 'error':
				sweetAlert(m.title, m.text, "error");
				break;
			case 'newGame':
				document.getElementById('game-code-cont').appendChild(document.createTextNode(m.id));
				setState('tgame');
				break;
			case 'addNewUser':
				var li = document.createElement('li');
				li.dataset.username = m.user;
				li.appendChild(document.createTextNode(m.user));
				li.onclick = removeUserFromGame;
				document.getElementById('loneusers').appendChild(li);
				usersWithoutCrews.push(m.user);
				break;
			case 'addUserToCrew':
				document.getElementById('loneusers').childNodes.forEach(function (e) {
					if (e.firstChild.nodeValue == m.user) e.parentNode.removeChild(e);
				});
				var span = document.createElement('span');
				span.dataset.username = m.user;
				span.className = 'clickable pill';
				span.onclick = removeUserFromCrew;
				span.appendChild(document.createTextNode(m.user));
				document.getElementById('crews').children[m.crew - 1].appendChild(span);
				document.getElementById('crews').children[m.crew - 1].dataset.n++;
				if (m.crew in crews) {
					crews[m.crew].users.push(m.user);
				} else {
					crews[m.crew] = {
						name: 'Crew ' + m.crew.toString(),
						users: [m.user],
						position: 0,
						status: 'rowing',
						boat: 'canoe'
					};
				}
				break;
			case 'startGame':
				document.getElementById('cont').hidden = true;
				setState('mountNode');
				gameHasStarted = true;
				gameHost = ReactDOM.render(React.createElement(GameHost, { initialCrews: crews }), document.getElementById('mountNode'));
				break;
			case 'answerSelected':
				gameHost.answerSelected(m.wasCorrectAnswer, m.crewNumber);
	
				break;
			case 'whirlpoolStatusChanged':
				gameHost.whirlpoolStatusChanged(m.status, m.crewNumber);
				break;
			case 'removeUser':
				var e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
				if (e) {
					e.parentNode.removeChild(e);
					// if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
				}
				break;
		}
	};
	
	socket.onclose = function () {
		sweetAlert("Server connection died.", "We're sorry about that.", "error");
	};
	document.getElementById('dashboard').addEventListener('submit', function (e) {
		document.getElementById('newGameButton').disabled = true;
		e.preventDefault();
		socket.send(JSON.stringify({ event: 'newGame' }));
	});
	
	document.getElementById('startGameButton').addEventListener('click', function (e) {
		document.getElementById('startGameButton').disabled = true;
		e.preventDefault();
		socket.send(JSON.stringify({
			event: 'startGame'
		}));
		// MARK: figure out our html
	});
	function endGame() {
		socket.send(JSON.stringify({
			event: 'endGame'
		}));
	}

/***/ }
/******/ ]);
//# sourceMappingURL=host.bundle.js.map