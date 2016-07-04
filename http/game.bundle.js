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
/******/ ({

/***/ 0:
/*!******************!*\
  !*** multi game ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! /Users/Alex/Documents/Programming/Aquaforces/http/game/game_components.jsx */1);
	module.exports = __webpack_require__(/*! /Users/Alex/Documents/Programming/Aquaforces/http/game/game.jsx */169);


/***/ },

/***/ 1:
/*!***************************************!*\
  !*** ./http/game/game_components.jsx ***!
  \***************************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var Game = React.createClass({
		displayName: 'Game',
		getInitialState: function getInitialState() {
			return {
				gameFinished: false,
				// GameTimer
				startTime: new Date(),
				// QuestionTimebar
				questionStartTime: null,
				// Question
				questionText: null,
				// Answer
				answers: [],
				answersToAdd: [],
				answerData: this.props.initialAnswers,
				answerPositions: {},
				// Canoe
				canoePosition: 0,
				canoeBounds: {
					left: 0.48,
					right: 0.52
				}
			};
		},
		componentWillMount: function componentWillMount() {
			var _this = this;
	
			setInterval(function () {
				// MARK: add checking for relooping
				var currentAnswers = _this.state.answers;
				/* KEEP THIS COMMENTED OUT
	   for (let currentAnswer in currentAnswers) {
	   	if (currentAnswer.state.position.y > innerHeight) {
	   		currentAnswers.remove(currentAnswer);
	   	}
	   }*/
				var answersToAdd = _this.state.answersToAdd;
				if (answersToAdd.length > 0) {
					currentAnswers.push(_this.generateAnswerComponent(answersToAdd.shift()));
					_this.setState({ answersToAdd: answersToAdd });
				} else {
					var randomData = _this.state.answerData[Math.floor(Math.random() * _this.state.answerData.length)];
					if (!(randomData in currentAnswers)) {
						currentAnswers.push(_this.generateAnswerComponent(randomData));
					}
				}
				_this.setState({
					answers: currentAnswers
				});
			}, 2500);
		},
		answerSelected: function answerSelected(answerText) {
			this.props.socket.send(JSON.stringify({
				event: 'answerSelected',
				answer: answerText,
				username: this.props.username,
				crewNumber: this.props.crewNumber
			}));
		},
		gameTimerOver: function gameTimerOver() {
			this.setState({
				gameFinished: true
			});
		},
		generateAnswerComponent: function generateAnswerComponent(answer) {
			return React.createElement(Answer, {
				text: answer,
				onClick: this.answerSelected.bind(this, answer),
				initialX: this.generateAnswerPosition(),
				canoeBounds: this.state.canoeBounds
			});
		},
		generateAnswerPosition: function generateAnswerPosition() {
			var answerSpawnLeftBoundary = innerWidth * -0.1;
			var answerSpawnRightBoundary = innerWidth * 0.65;
			var newLeftBound = answerSpawnLeftBoundary;
			var newRightBound = answerSpawnRightBoundary;
			var currentXPositions = [];
			var currentMaximumGap = 0;
			for (var i = 0; i < 2; i++) {
				var oneOfTopmostAnswers = this.state.answers.slice().reverse()[i];
				if (oneOfTopmostAnswers) {
					currentXPositions.push(oneOfTopmostAnswers.props.initialX);
				}
			}
	
			function sortAscending(a, b) {
				return a - b;
			}
	
			currentXPositions = [newLeftBound].concat(currentXPositions.sort(sortAscending)).concat([newRightBound]).sort(sortAscending);
			for (var _i = 1; _i < currentXPositions.length; _i++) {
				var currentGap = currentXPositions[_i] - currentXPositions[_i - 1];
				if (currentGap > currentMaximumGap) {
					currentMaximumGap = currentGap;
					newLeftBound = currentXPositions[_i - 1];
					newRightBound = currentXPositions[_i];
				}
			}
			newLeftBound += currentMaximumGap * 0.25;
			newRightBound -= currentMaximumGap * 0.25;
			return newLeftBound + Math.random() * (newRightBound - newLeftBound);
		},
		correctAnswer: function correctAnswer() {
			// MARK: correct answer animation
	
		},
		incorrectAnswer: function incorrectAnswer() {
			// MARK: incorrect answer animation
		},
		newQuestion: function newQuestion(question) {
			this.setState({
				questionText: question
			});
			this.refs.questionTimebar.reset();
		},
		addCorrectAnswer: function addCorrectAnswer(answer) {
			// add a random number of wrong answers before correct answer
	
			var oldAnswersToAdd = this.state.answersToAdd;
			var incorrectAnswers = [];
			var incorrectAnswersToAdd = Math.floor(Math.random() * 2);
			for (var i = 0; i < incorrectAnswersToAdd; i++) {
				var randomData = this.state.answerData[Math.floor(Math.random() * this.state.answerData.length)];
				incorrectAnswers.push(randomData);
			}
			var currentAnswersToAdd = oldAnswersToAdd.concat(incorrectAnswers);
			currentAnswersToAdd.push(answer);
	
			this.setState({
				answersToAdd: currentAnswersToAdd
			});
		},
		questionTimeout: function questionTimeout() {
			this.props.socket.send(JSON.stringify({
				event: 'questionTimeout',
				crewNumber: this.props.crewNumber,
				question: this.state.questionText
			}));
		},
		render: function render() {
			// MARK: add flashing
			return React.createElement(
				'div',
				{ className: 'container', hidden: this.state.gameFinished },
				React.createElement(
					'div',
					{ className: 'panel-group' },
					React.createElement(
						'div',
						{ className: 'panel-top' },
						React.createElement(GameTimer, { onFinish: this.gameTimerOver, totalTime: 900000 }),
						React.createElement(Question, { text: this.state.questionText })
					),
					React.createElement(
						'div',
						{ className: 'panel-bottom' },
						React.createElement(QuestionTimebar, { onTimeout: this.questionTimeout, timePerQuestion: 10000, ref: 'questionTimebar' })
					)
				),
				React.createElement(River, {
					position: this.state.canoePosition,
					initialImage: '../assets/canoe/canoe_full_health.png',
					answersDisplayed: this.state.answers
				})
			);
		}
	});
	
	var Answer = React.createClass({
		displayName: 'Answer',
		getInitialState: function getInitialState() {
			var initialY = Math.random() * 100 - 100;
			var vx = (Math.random() - 0.5) / 300;
			var vy = (Math.random() - 0.5) / 150 + innerHeight / 15000;
			return {
				position: {
					x: this.props.initialX,
					y: initialY
				},
				velocity: {
					vx: vx,
					vy: vy
				},
				disappeared: false,
				hasCrossedThreshold: false
			};
		},
		setPosition: function setPosition() {
			var timeAtAnimation = new Date().getTime();
			var dt = timeAtAnimation - this.state.lastAnimationTime;
	
			var leftBoundary = this.props.canoeBounds.left;
			var rightBoundary = this.props.canoeBounds.right;
	
			var positionX = this.state.position.x;
			var positionY = this.state.position.y;
			var velocityX = this.state.velocity.vx;
			var velocityY = this.state.velocity.vy;
			var offsetWidth = this.refs.answer.offsetWidth;
	
			// ugly physics code beware
			if (positionX + offsetWidth / 2 < innerWidth / 2) {
				velocityX += dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-positionX) / 100) - Math.min(0.001, Math.exp(positionX + offsetWidth - innerWidth * leftBoundary) / 100)) || 0;
			} else {
				velocityX += dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-positionX + innerWidth * rightBoundary) / 100) - Math.min(0.001, Math.exp(positionX + offsetWidth - innerWidth) / 100)) || 0;
			}
			velocityX /= 1.05;
	
			velocityY += dt * ((Math.random() - 0.5) / 10000);
			if (velocityY < 0.03) velocityY = +velocityY + 0.03;
	
			positionX += velocityX * dt;
			positionY += velocityY * dt;
	
			this.setState({
				position: { x: positionX, y: positionY },
				velocity: { vx: velocityX, vy: velocityY },
				lastAnimationTime: timeAtAnimation
			});
		},
		componentDidMount: function componentDidMount() {
			var currentTime = new Date().getTime();
			this.setState({
				startTime: currentTime,
				lastAnimationTime: currentTime
			}, function () {
				this.animate(new Date());
			});
		},
		handleClick: function handleClick() {
			this.setState({
				disappeared: true
			});
			this.props.onClick();
		},
		animate: function animate(timestamp) {
			this.setPosition();
			window.requestAnimationFrame(this.animate);
		},
		render: function render() {
			var style = {
				transform: 'translate(' + this.state.position.x + 'px, ' + this.state.position.y + 'px)'
			};
			if (!this.state.disappeared) return React.createElement(
				'span',
				{ style: style, onClick: this.handleClick, ref: 'answer' },
				this.props.text
			);else {
				return null;
			}
		}
	});
	
	var Canoe = React.createClass({
		displayName: 'Canoe',
		getInitialState: function getInitialState() {
			return {
				hp: 100,
				image: this.props.initialImage
			};
		},
		render: function render() {
			return null;
			/* (<img id = "canoe" src = {this.state.image}></img>)*/
		}
	});
	
	var River = React.createClass({
		displayName: 'River',
		getInitialState: function getInitialState() {
			return {
				image: React.createElement('img', null)
			};
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'river' },
				React.createElement(Canoe, { position: this.props.position, initialImage: this.props.initialImage }),
				React.createElement(
					'div',
					{ className: 'answers' },
					this.props.answersDisplayed
				)
			);
		}
	});
	
	var Question = React.createClass({
		displayName: 'Question',
		render: function render() {
			return React.createElement(
				'h2',
				{ id: 'question' },
				this.props.text
			);
		}
	});
	
	var QuestionTimebar = React.createClass({
		displayName: 'QuestionTimebar',
		getInitialState: function getInitialState() {
			return {
				timeLeft: this.props.timePerQuestion,
				timeStart: new Date().getTime()
			};
		},
		componentDidMount: function componentDidMount() {
			var _this2 = this;
	
			setInterval(function () {
				_this2.updateTime();
			}, 50);
		},
		updateTime: function updateTime() {
			var currentTime = new Date().getTime();
			var timeLeft = this.props.timePerQuestion - currentTime + this.state.timeStart;
			if (timeLeft < 0) {
				this.props.onTimeout();
			} else {
				this.setState({ timeLeft: timeLeft });
			}
		},
		reset: function reset() {
			this.setState({
				timeLeft: this.props.timePerQuestion,
				timeStart: new Date().getTime()
			});
		},
		render: function render() {
			var style = {
				width: (this.state.timeLeft / this.props.timePerQuestion * 100).toString() + '%',
				backgroundColor: '#26A65B',
				height: '20px'
			};
			return React.createElement('div', { style: style, id: 'questionTime' });
		}
	});
	
	var GameTimer = React.createClass({
		displayName: 'GameTimer',
	
		propTypes: {
			onFinish: React.PropTypes.func
		},
		getInitialState: function getInitialState() {
			return {
				time: '',
				finished: false,
				timeStart: new Date().getTime()
			};
		},
		zeroPad: function zeroPad(t) {
			if (t < 10) return '0' + t;
			return t;
		},
		updateTimer: function updateTimer() {
			var currentTime = new Date().getTime();
			var ms = this.props.totalTime - currentTime + this.state.timeStart + 1000;
			var t = '';
			if (ms < 0) {
				this.props.onFinish();
				this.setState({
					finished: true
				});
			} else if (ms < 10000) {
				t = Math.floor(ms / 60000) + ':0' + (ms / 1000).toFixed(2);
			} else {
				t = Math.floor(ms / 60000) + ':' + this.zeroPad(Math.floor(ms / 1000 % 60));
			}
			this.setState({
				time: t
			});
		},
		componentDidMount: function componentDidMount() {
			var _this3 = this;
	
			setInterval(function () {
				if (!_this3.state.finished) {
					_this3.updateTimer();
				}
			}, 50);
		},
		render: function render() {
			return React.createElement(
				'p',
				{ hidden: this.state.finished },
				'Time remaining: ',
				this.state.time
			);
		}
	});
	exports.default = Game;

/***/ },

/***/ 169:
/*!****************************!*\
  !*** ./http/game/game.jsx ***!
  \****************************/
/***/ function(module, exports) {

	'use strict';
	
	var socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/');
	var cont = document.getElementById('cont');
	var errorEl = document.getElementById('error');
	var gameHasEnded = false;
	var answers = [];
	
	var game = void 0;
	var username = void 0;
	var crewNumber = void 0;
	
	function setState(id) {
		errorEl.textContent = '';
		cont.children.forEach(function (e) {
			if (e.id !== id) {
				e.hidden = true;
			}
		});
		document.getElementById(id).hidden = false;
		// if filling out form, automatically focus
		// to the next input field
		var e = document.getElementById(id).getElementsByTagName('input');
		if (e.length) e[e.length - 1].focus();
	}
	
	function setupGameEnvironment() {
		document.getElementById('content').hidden = true;
		document.body.style = 'background: #e3d393 url(\'/assets/beach-background.png\')\n\t\trepeat-x center top; background-size: cover;';
	}
	
	socket.onmessage = function (m) {
		try {
			m = JSON.parse(m.data);
		} catch (e) {
			console.log(e);
			return alert('Socket error.');
		}
	
		switch (m.event) {
			case 'notice':
				errorEl.textContent = m.body;
				errorEl.scrollIntoView();
				break;
			case 'error':
				errorEl.textContent = m.body;
				errorEl.scrollIntoView();
				break;
			case 'addUser':
				setState('crew');
				break;
			case 'startGame':
				setState('mountNode');
				setupGameEnvironment();
				answers = m.answers;
				game = reactDOM.render(React.createElement(Game, {
					socket: socket, username: username,
					crewNumber: crewNumber, initialAnswers: m.answers
				}), document.getElementById('mountNode'));
				break;
			case 'answerSelected':
				if (m.wasCorrectAnswer) {
					game.correctAnswer();
				} else {
					game.incorrectAnswer();
				}
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
		errorEl.textContent = 'Socket closed.';
	};
	document.getElementById('join').addEventListener('submit', function (e) {
		e.preventDefault();
		socket.send(JSON.stringify({
			event: 'addUser',
			code: parseInt(document.getElementById('game-code').value, 10),
			name: document.getElementById('crewmember-name').value
		}));
		username = document.getElementById('crewmember-name').value;
	});
	
	document.getElementById('crew').addEventListener('submit', function (e) {
		e.preventDefault();
		socket.send(JSON.stringify({
			event: 'addUserToCrew',
			crewNumber: parseInt(document.getElementById('crewno').value, 10)
		}));
		document.getElementById('crewnodisplay').textContent = parseInt(document.getElementById('crewno').value, 10);
		crewNumber = parseInt(document.getElementById('crewno').value, 10);
		setState('wait');
	});

/***/ }

/******/ });
//# sourceMappingURL=game.bundle.js.map