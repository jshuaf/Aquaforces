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
/*!******************!*\
  !*** multi host ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! /Users/Alex/Documents/Programming/Aquaforces/http/host/host_components.jsx */3);
	module.exports = __webpack_require__(/*! /Users/Alex/Documents/Programming/Aquaforces/http/host/host.jsx */4);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/*!***************************************!*\
  !*** ./http/host/host_components.jsx ***!
  \***************************************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function getValuesOfObject(object) {
		var values = [];
		for (var key in object) {
			values.push(object[key]);
		}
		return values;
	}
	
	var GameHost = React.createClass({
		displayName: "GameHost",
	
		// MARK: ADD END GAME
		getInitialState: function getInitialState() {
			return {
				gameStatus: 'hasNotStarted',
				startTime: new Date(),
				crews: this.props.initialCrews
			};
		},
		answerSelected: function answerSelected(wasCorrectAnswer, crewNumber) {
			var crew = this.refs[crewNumber.toString()];
			if (wasCorrectAnswer) this.updateCrewPosition(crewNumber, 0.1);
			crew.processAnswer(wasCorrectAnswer);
		},
		updateCrewPosition: function updateCrewPosition(crewNumber, increment) {
			// MARK: move the camera around
	
			var oldCrews = this.state.crews;
			oldCrews[crewNumber].position += increment;
			this.setState({
				crews: oldCrews
			});
		},
		updateCrewStatus: function updateCrewStatus(crewNumber, newStatus) {
			var oldCrews = this.state;
			oldCrews.crews[crewNumber].props.status = newStatus;
			this.setState(oldCrews);
		},
		updateCrewBoat: function updateCrewBoat(crewNumber, newBoat) {
			var oldCrews = this.state;
			oldCrews.crews[crewNumber].props.boat = newBoat;
			this.setState(oldCrews);
		},
		render: function render() {
			return React.createElement(
				"div",
				{ className: "container" },
				React.createElement(
					"div",
					{ className: "row" },
					React.createElement(
						"div",
						{ className: "four columns" },
						React.createElement(
							"div",
							{ className: "panel" },
							React.createElement(Leaderboard, { crews: this.state.crews })
						)
					),
					React.createElement(
						"div",
						{ className: "eight columns" },
						React.createElement(
							"div",
							{ className: "panel" },
							Object.keys(this.state.crews).map(function (crewNumber, i) {
								var crew = this.state.crews[crewNumber];
								return React.createElement(Crew, { position: crew.position, status: crew.status, boat: crew.boat, crewNumber: crewNumber, key: i, ref: crewNumber.toString() });
							}.bind(this))
						)
					)
				)
			);
		}
	});
	
	var Crew = React.createClass({
		displayName: "Crew",
		getInitialState: function getInitialState() {
			return {
				position: 0,
				velocity: 0,
				deltaVelocity: 10,
				maximumDeltaVelocity: 10,
				hp: 1,
				current: -0.1,
				isRaft: false
			};
		},
		getDefaultProps: function getDefaultProps() {
			return {
				currentConstant: 0.003,
				velocityConstant: 0.00001,
				deltaHPConstant: -0.1
			};
		},
		processAnswer: function processAnswer(wasCorrectAnswer) {
			if (wasCorrectAnswer) {
				this.setState({
					velocity: this.state.velocity + this.state.deltaVelocity
				});
			} else if (this.state.isRaft) {
				this.setState({ deltaVelocity: this.state.deltaVelocity * 0.95 });
			} else {
				this.setState({
					hp: this.state.hp + this.props.deltaHPConstant
				});
				if (!this.state.isRaft && this.state.hp <= 0) {
					this.setState({ isRaft: true });
				}
			}
		},
		render: function render() {
			var style = {
				width: '7rem',
				transform: 'translate(' + this.state.position * 200 + ' px, 0 px)',
				backgroundColor: 'red',
				height: '3rem'
			};
			var className = this.state.isRaft ? 'raft' : '';
			return React.createElement("div", { className: className, style: style });
		}
	});
	
	var Leaderboard = React.createClass({
		displayName: "Leaderboard",
	
		// MARK: make leaderboard sort
		render: function render() {
			var style = {
				borderStyle: 'dotted',
				borderColor: 'green',
				borderWidth: 1.0
			};
			return React.createElement(
				"div",
				null,
				React.createElement(
					"h4",
					null,
					React.createElement(
						"strong",
						null,
						"Leaderboard"
					)
				),
				Object.keys(this.props.crews).map(function (crewNumber, i) {
					var crew = this.props.crews[crewNumber];
					return React.createElement(LeaderboardEntry, { crewNumber: crewNumber, crewPosition: crew.position, key: i });
				}.bind(this))
			);
		}
	});
	
	var LeaderboardEntry = React.createClass({
		displayName: "LeaderboardEntry",
		render: function render() {
			var style = {
				fontSize: (this.props.crewPosition + 1) * 15 + 'px',
				padding: 5 + this.props.position + 'px',
				color: 'white'
			};
			return React.createElement(
				"div",
				{ className: "leaderboardEntry" },
				React.createElement(
					"h5",
					null,
					"Crew ",
					this.props.crewNumber,
					": ",
					React.createElement(
						"span",
						{ style: style },
						Math.round(this.props.crewPosition * 10) / 10
					)
				)
			);
		}
	});
	
	exports.default = GameHost;

/***/ },
/* 4 */
/*!****************************!*\
  !*** ./http/host/host.jsx ***!
  \****************************/
/***/ function(module, exports) {

	'use strict';
	
	var socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
	var cont = document.getElementById('cont'),
	    errorEl = document.getElementById('error');
	
	var crews = {};
	var usersWithoutCrews = [];
	
	var gameHost = void 0;
	var gameHasStarted = false;
	
	function setState(id) {
		// hide and show different elements
		errorEl.textContent = '';
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
				usersWithoutCrews.remove(username);
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
	
		crews.forEach(crewNumber, function () {
			var crewmembers = crews.crewNumber.users;
			crewmembers.forEach(crewmember, function () {
				if (crewmember == this.dataset.username) {
					crewmembers.remove(crewmember);
					return;
				}
			});
		});
	}
	
	socket.onmessage = function (m) {
		try {
			m = JSON.parse(m.data);
		} catch (e) {
			console.log(e);
			return alert('Socket error.');
		}
		switch (m.event) {
			case 'error':
				alert(m.body);
				setState(m.state);
				errorEl.textContent = m.body;
				break;
			case 'newGame':
				document.getElementById('game-code-cont').appendChild(document.createTextNode(m.id));
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
				var sign = document.createElement('span');
				sign.appendChild(document.createTextNode('<'));
				var span = document.createElement('span');
				span.dataset.username = m.user;
				span.className = 'clickable';
				span.onclick = removeUserFromCrew;
				span.appendChild(document.createTextNode(m.user));
				document.getElementById('crews').children[m.crew - 1].appendChild(span);
				document.getElementById('crews').children[m.crew - 1].dataset.n++;
				document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
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
			case 'answerSelected':
				gameHost.answerSelected(m.wasCorrectAnswer, m.crewNumber);
				break;
			case 'removeUser':
				var e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
				if (e) {
					e.parentNode.removeChild(e);
					// if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
				}
				document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
				break;
		}
	};
	
	socket.onclose = function () {
		errorEl.textContent = 'Socket closed.';
	};
	document.getElementById('dashboard').addEventListener('submit', function (e) {
		e.preventDefault();
		socket.send(JSON.stringify({ event: 'newGame' }));
		setState('tgame');
	});
	
	document.getElementById('start-game-btn').addEventListener('click', function (e) {
		e.preventDefault();
		socket.send(JSON.stringify({
			event: 'startGame'
		}));
		// MARK: figure out our html
		document.getElementById('cont').hidden = true;
		setState('mountNode');
		gameHasStarted = true;
		gameHost = reactDOM.render(React.createElement(GameHost, { initialCrews: crews }), document.getElementById('mountNode'));
	});
	function endGame() {
		socket.send(JSON.stringify({
			event: 'endGame'
		}));
	}

/***/ }
/******/ ]);
//# sourceMappingURL=host.bundle.js.map