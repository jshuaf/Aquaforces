const Game = React.createClass({
	getInitialState() {
		return {
			gameFinished: false,
			// GameTimer
			startTime: new Date(),
			// QuestionTimebar
			questionStartTime: null,
			// Question
			questionText: null,
			// Canoe
			canoePosition: 0,
			canoeBounds: {
				left: 0.48,
				right: 0.52
			},
			// Rock
			rock: false,
			rockYPosition: -window.innerHeight * 0.2,
			rockHeight: null,
			rockStartTime: null,
			rockAnimation: null,
			// Whirlpool
			whirlpool: false,
			whirlpoolType: 'Free',
			whirlpoolQuestion: {},
			whirlpoolTimebar: null,
			whirlpoolBonus: 0,
			canoeHP: 100,
			canoeTopPosition: null,
			canoeHeight: null,
			// River
			riverTopPosition: null,
			flashClass: ""
		};
	},

	answerSelected(answerText) {
		this.props.socket.send(JSON.stringify({
			event: 'answerSelected',
			answer: answerText,
			username: this.props.username,
			crewNumber: this.props.crewNumber
		}));
	},

	gameTimerOver() {
		this.setState({
			gameFinished: true
		});
	},

	addWhirlpoolTap() {
		this.setState({
			whirlpool: true,
			whirlpoolType: 'Free'
		});
	},

	addWhirlpoolQuestion(question) {
		this.setState({
			whirlpool: true,
			whirlpoolType: 'Question',
			whirlpoolQuestion: question
		});
	},

	answerPassedThreshold(answerText) {
		this.props.socket.send(JSON.stringify({
			event: 'answerPassedThreshold',
			answer: answerText,
			crewNumber: this.props.crewNumber
		}));
	},

	newQuestion(question) {
		this.setState({
			questionText: question
		});
		this.refs.questionTimebar.reset();
	},

	correctAnswer() {
		// MARK: correct answer animation

	},

	incorrectAnswer() {
		// MARK: incorrect answer animation
	},

	addCorrectAnswer(answer) {
		// add a random number of wrong answers before correct answer
		this.refs.river.addCorrectAnswer(answer);
	},

	whirlpoolQuestionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'whirlpoolQuestionTimeout',
			crewNumber: this.props.crewNumber
		}));
	},

	questionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'questionTimeout',
			crewNumber: this.props.crewNumber,
			question: this.state.questionText
		}));
	},

	updateHP(canoeHP) {
		this.setState({canoeHP});
	},

	addRock(rockStartTime) {
		const timeBeforeHit = 20000;
		this.setState({
			rockStartTime,
			rock: true
		});

		const rockAnimation = setInterval(this.animateRock, 25);
		this.setState({rockAnimation});
	},

	animateRock() {
		const timeDifference = (Date.now() - this.state.rockStartTime) / 1000;
		if (timeDifference && timeDifference > 0) {
			const y = timeDifference * window.innerHeight / 10;
			if (this.state.riverTopPosition) {
				const positionLimit = this.state.canoeTopPosition - this.state.riverTopPosition - this.state.rockHeight - this.state.canoeHeight;
				if (positionLimit < y) {
					clearInterval(this.state.rockAnimation);
					this.rockHit();
					return;
				}
			}
			this.setState({
				rockYPosition: y
			});
		}
	},

	rockHit() {
		this.flashRedTwice();
		const y = -window.innerHeight * 0.2;
		this.setState((previousState, previousProps) => (
			{
				rockYPosition: y,
				canoeHP: previousState.canoeHP - 30
			}
		));
	},

	clearFlash() {
		setTimeout(() => {
			this.setState({
				flashClass: ""
			});
		}, 1000);
	},

	flashRedTwice() {
		this.setState({
			flashClass: " flash-red-twice"
		}, this.clearFlash);
	},

	endRock() {
		this.setState({
			rock: false,
			rockYPosition: -window.innerHeight * 0.2
		});
		alert("saved from rock");
	},

	rockAnimationData(riverTopPosition, canoeTopPosition, canoeHeight, rockHeight) {
		this.setState({riverTopPosition, canoeTopPosition, canoeHeight, rockHeight});
	},

	render() {
		// MARK: add flashing
		let whirlpoolValue;
		this.state.whirlpoolTimebar = <QuestionTimebar onTimeout={this.whirlpoolQuestionTimeout} timePerQuestion={5000 + this.state.whirlpoolBonus} keepRunning={this.state.whirlpool} />;
		if (this.state.whirlpool) {
			if (this.state.whirlpoolType == "Free") {
				whirlpoolValue = (
					<div className="modal-background">
						<div className="row">
							<div className="three columns"><p></p></div>
							<div className="six columns">
								<WhirlpoolFree socket = {this.props.socket} />
							</div>
						</div>
					</div>
				);
			}
			else {
				whirlpoolValue = (
					<div className="modal-background">
						<div className="row">
							<div className="three columns"><p></p></div>
							<div className="six columns">
								<WhirlpoolQuestion question = {this.state.whirlpoolQuestion} timebar = {this.state.whirlpoolTimebar} socket = {this.props.socket} />
							</div>
						</div>
					</div>
				);
			}
		}
		const timePerQuestion = this.state.rock ? 10000 : 15000;
		return (
			<div className="container" hidden={this.state.gameFinished}>
				<div>{whirlpoolValue}</div>
				<div className="panel-group">
					<div className="panel-top">
						<GameTimer onFinish={this.gameTimerOver} totalTime={900000} />
						<Question text={this.state.questionText} />
					</div>
					<div className="panel-bottom">
						<QuestionTimebar onTimeout={this.questionTimeout} timePerQuestion={20000} ref="questionTimebar" keepRunning={!this.state.whirlpool}></QuestionTimebar>
					</div>
				</div>
				<River ref = "river"
					initialAnswers = {this.props.initialAnswers}
					answerSelected = {this.answerSelected}
					answerPassedThreshold = {this.answerPassedThreshold}
					rock={this.state.rock}
					rockYPosition = {this.state.rockYPosition}
					rockAnimationData = {this.rockAnimationData}
					flashClass = {this.state.flashClass}
					canoeHP = {this.state.canoeHP}
					crewSize = {this.props.crewSize}
				/>
      </div>
    );
	}
});

const Answer = React.createClass({
	getInitialState() {
		let initialY = Math.random() * 100 - 100;
		let vx = (Math.random() - 0.5) / 300;
		let vy = (Math.random() - 0.5) / 150 + innerHeight / 15000;
		return {
			position: {
				x: null,
				y: initialY
			},
			velocity: {
				vx,
				vy
			},
			disappeared: false,
			passedThreshold: false
		};
	},

	setPosition() {
		const timeAtAnimation = Date.now();
		const dt = timeAtAnimation - this.state.lastAnimationTime;

		let positionX = this.state.position.x;
		let positionY = this.state.position.y;
		let velocityX = this.state.velocity.vx;
		let velocityY = this.state.velocity.vy;
		let offsetWidth = this.state.offsetWidth;

		velocityY += dt * ((Math.random() - 0.5) / 10000);
		if ((velocityY) < 0.03) velocityY = +velocityY + 0.03;

		// check if it's already passed the threshold
		if (positionY > this.props.riverBounds.bottom) {return;}

		// increment
		positionX += (velocityX) * dt;
		positionY += (velocityY) * dt;

		// check if it's passing the threshold for the first time
		if (positionY > this.props.riverBounds.bottom) {
			this.setState({
				passedThreshold: true
			});
		}

		this.setState({
			position: {x: positionX, y: positionY},
			velocity: {vx: velocityX, vy: velocityY},
			lastAnimationTime: timeAtAnimation
		});
	},

	componentDidMount() {
		const currentTime = Date.now();
		const initialX = this.props.generateAnswerPosition(this.refs.answer.offsetWidth);
		this.setState((previousState, previousProps) => (
			{
				startTime: currentTime,
				lastAnimationTime: currentTime,
				position: {x: initialX, y: previousState.position.y},
				offsetWidth: this.refs.answer.offsetWidth
			}), () => {
			const positionAnimation = this.animate(new Date());
			this.setState({positionAnimation});
		});
	},

	handleClick() {
		this.setState({
			disappeared: true
		});
		this.props.onClick(this.props.text);
	},

	animate(timestamp) {
		if (this.props.keepRunning && !(this.state.passedThreshold)) {
			this.setPosition();
			requestAnimationFrame(this.animate);
		} else {
			this.props.answerPassedThreshold(this.props.text);
		}
	},

	render() {
		const style = {
			transform: 'translate(' + this.state.position.x + 'px, ' + this.state.position.y + 'px)'
		};
		if (!this.state.disappeared)
			return <span style={style} onClick={this.handleClick} ref = "answer" className = "pill">{this.props.text}</span>;
		else {
			return null;
		}
	}
});

const Canoe = React.createClass({
	getInitialState() {
		return {
			height: null,
			topPosition: null
		};
	},

	componentDidMount() {
		this.setState({
			height: this.refs.canoe.offsetHeight,
			width: this.refs.canoe.offsetWidth,
			parentWidth: this.refs.canoe.parentElement.clientWidth,
			topPosition: this.refs.canoe.getBoundingClientRect().top
		});
	},

	render() {
		// shake 0.82s cubic-bezier(.36,.07,.19,.97) both
		const hp = this.props.hp;
		let image = "../img/boats-top";

		if (hp > 50) {
			image += "/canoe-100";
		} else if (hp > 25) {
			image += "/canoe-50";
		} else if (hp > 10) {
			image += "/canoe-25";
		} else if (hp > 0) {
			image += "/canoe-10";
		} else if (hp <= 0) {
			image += "/rafts";
		}

		image += `/${this.props.crewSize}-members.svg`;

		const style = {
			height: '50%',
			transform: `translate(${0}px, ${window.innerHeight / 3.5}px)`
		};
		return (<img id = "canoe" src = {image} style = {style} ref = "canoe"></img>);
	}
});

const River = React.createClass({
	getInitialState() {
		return {
			// Answers
			answers: [],
			answersToAdd: [],
			answersToRemove: [],
			answerData: this.props.initialAnswers,
			initialAnswerXPositions: [],
			// River Reflections
			riverReflectionGroups: [],
			lastAnimationTime: null,
			// River
			riverWidth: null,
			riverHeight: null
		};
	},

	answerPassedThreshold(answerText) {
		this.props.answerPassedThreshold(answerText);
		let answersToRemove = this.state.answersToRemove;
		const removalIndex = answersToRemove.indexOf(answerText);
		if (removalIndex <= -1) {
			answersToRemove.push(answerText);
		}
		this.setState({answersToRemove});
	},

	updateAnswers() {
		const currentAnswers = this.state.answers;
		const answersToAdd = this.state.answersToAdd;
		const answersToRemove = this.state.answersToRemove;

		let newAnswer;
		if (answersToAdd.length > 0) {
			newAnswer = answersToAdd.shift();
			this.setState({answersToAdd});
		} else {
			let randomData = this.state.answerData[Math.floor(
				Math.random() * this.state.answerData.length)];
			while (currentAnswers.indexOf(randomData) >= 0) {
				randomData = this.state.answerData[Math.floor(
					Math.random() * this.state.answerData.length)];
			}
			newAnswer = randomData;
		}

		currentAnswers.push(newAnswer);

		if (answersToRemove.length > 0) {
			const removalIndex = currentAnswers.indexOf(answersToRemove.shift());
			currentAnswers.splice(removalIndex, 1);
			this.setState({answersToRemove});
		}

		this.setState({
			answers: currentAnswers
		});
	},

	componentDidMount() {
		// Constants
		const river = this.refs.river;
		const riverRect = river.getBoundingClientRect();
		const canoe = ReactDOM.findDOMNode(this.refs.canoe);
		const canoeRect = canoe.getBoundingClientRect();
		const rockHeight = ReactDOM.findDOMNode(this.refs.rock).offsetHeight;

		// Rocks
		this.props.rockAnimationData(riverRect.top, canoeRect.top, canoe.offsetHeight, rockHeight);

		// River Reflections
		this.setState({riverWidth: river.offsetWidth, riverHeight: river.offsetHeight});
		this.startRiverReflections();
		// Answers
		this.updateAnswers();
		setInterval(this.updateAnswers, 2500);
	},

	findMaximumGap(positions) {
		// find the best place to add a new element, given a list of positions
		let currentMaximumGap = 0;
		let newLeftBound, newRightBound;
		for (let i = 1; i < positions.length; i++) {
			const currentGap = positions[i] - positions[i - 1];
			if (currentGap > currentMaximumGap) {
				currentMaximumGap = currentGap;
				newLeftBound = positions[i - 1];
				newRightBound = positions[i];
			}
		}

		newLeftBound += currentMaximumGap * 0.25;
		newRightBound -= currentMaximumGap * 0.25;
		return newLeftBound + Math.random() * (newRightBound - newLeftBound);
	},

	startRiverReflections() {
		const riverBounds = this.riverBounds();
		const riverHeight = riverBounds.bottom - riverBounds.top;
		const initialXPositions = [0, riverBounds.right - riverBounds.left - this.refs.river.offsetWidth * 0.15];
		const initialYPositions = [-riverHeight, riverHeight * 2];
		const initialReflectionCount = Math.floor(6 + Math.random() * 3);
		const riverReflectionGroups = [];
		function ascending(a, b) {return a - b;}

		for (let i of Array(initialReflectionCount).keys()) {
			const newXPosition = this.findMaximumGap(initialXPositions);
			const newYPosition = this.findMaximumGap(initialYPositions);
			initialXPositions.push(newXPosition);
			initialXPositions.sort(ascending);
			initialYPositions.push(newYPosition);
			initialYPositions.sort(ascending);
			riverReflectionGroups.push({
				x: newXPosition, y: newYPosition, key: newXPosition});
		}

		this.setState({riverReflectionGroups, lastAnimationTime: Date.now()}, () => {
			requestAnimationFrame(this.updateRiverReflections);
		});
	},

	updateRiverReflections(timestamp) {
		this.setState((previousState, previousProps) => {
			const currentGroups = previousState.riverReflectionGroups;
			const currentTime = Date.now();
			const timeSinceLastAnimation = currentTime - previousState.lastAnimationTime;
			for (let currentGroup of currentGroups) {
				currentGroup.y -= (timeSinceLastAnimation / 1000) * (previousState.riverHeight / 50);
			}
			return {
				riverReflectionGroups: currentGroups,
				lastAnimationTime: currentTime
			};
		}, () => {
			requestAnimationFrame(this.updateRiverReflections);
		});
	},

	generateAnswerPosition(answerWidth) {
		const riverBounds = this.riverBounds();
		const canoeBounds = this.canoeBounds();

		// answers should spawn between screenleft and canoeleft or screenright and canoeright
		const screenLeft = 0;
		const canoeLeft = canoeBounds.left - riverBounds.left - answerWidth;
		const canoeRight = canoeBounds.right - riverBounds.left;
		const screenRight = riverBounds.right - riverBounds.left - answerWidth;

		function ascending(a, b) {return a - b;}

		let topmostXPositions = this.state.initialAnswerXPositions.slice().reverse().slice(0, 2).sort(ascending);
		let currentPositions = {
			left: [screenLeft],
			right: [canoeRight]
		};

		for (let topmostXPosition of topmostXPositions) {
			if (topmostXPosition > screenLeft && topmostXPosition < canoeLeft) {
				currentPositions.left.push(topmostXPosition);
			} else if (topmostXPosition > canoeRight && topmostXPosition < screenRight) {
				currentPositions.right.push(topmostXPosition);
			}
		}
		currentPositions.left.push(canoeLeft);
		currentPositions.right.push(screenRight);

		let currentMaximumGap = 0;
		let newLeftBound, newRightBound;

		Object.keys(currentPositions).forEach((side) => {
			const currentSidePositions = currentPositions[side];
			for (let i = 1; i < currentSidePositions.length; i++) {
				const currentGap = currentSidePositions[i] - currentSidePositions[i - 1];
				if (currentGap > currentMaximumGap) {
					currentMaximumGap = currentGap;
					newLeftBound = currentSidePositions[i - 1];
					newRightBound = currentSidePositions[i];
				}
			}
    });

		newLeftBound += currentMaximumGap * 0.25;
		newRightBound -= currentMaximumGap * 0.25;
		const newPosition = newLeftBound + Math.random() * (newRightBound - newLeftBound);
		this.setState((previousState, previousProps) => (
			{initialAnswerXPositions: previousState.initialAnswerXPositions.concat([newPosition])}
		));
		return newPosition;
	},

	addCorrectAnswer(answer) {
		const oldAnswersToAdd = this.state.answersToAdd;
		const incorrectAnswers = [];
		const incorrectAnswersToAdd = Math.floor(Math.random() * 2);
		for (let i = 0; i < incorrectAnswersToAdd; i++) {
			let randomData = this.state.answerData[Math.floor(Math.random() * this.state.answerData.length)];
			while (this.state.answers.indexOf(randomData) >= 0) {
				randomData = this.state.answerData[Math.floor(Math.random() * this.state.answerData.length)];
			}
			incorrectAnswers.push(randomData);
		}
		const currentAnswersToAdd = oldAnswersToAdd.concat(incorrectAnswers);
		currentAnswersToAdd.push(answer);

		this.setState({
			answersToAdd: currentAnswersToAdd
		});
	},

	canoeBounds() {
		const canoe = ReactDOM.findDOMNode(this.refs.canoe);
		return canoe.getBoundingClientRect();
	},

	riverBounds() {
		const river = this.refs.river;
		return river.getBoundingClientRect();
	},

	render() {
		let answers = [];

		for (let i = 0; i < this.state.answers.length; i++) {
			answers.push(<Answer
				text={this.state.answers[i]}
				key={this.state.answerData.indexOf(this.state.answers[i])}
				onClick={this.props.answerSelected}
				answerPassedThreshold={this.answerPassedThreshold}
				generateAnswerPosition={this.generateAnswerPosition}
				riverBounds={this.riverBounds()}
				canoeBounds={this.canoeBounds()}
				keepRunning={!this.props.whirlpool}
			/>);
		}
		return (
			<div className={"river" + this.props.flashClass} ref = "river">
				<div className="answers">
					{answers}
					{this.state.riverReflectionGroups.map((riverReflectionGroup) =>
						<RiverReflectionGroup
							x = {riverReflectionGroup.x}
							y = {riverReflectionGroup.y}
							riverWidth = {this.state.riverWidth}
							key = {riverReflectionGroup.key}
						/>
					)}
					<Rock
						y = {this.props.rockYPosition}
						ref = "rock"
					/>
					<Canoe initialImage = {this.props.initialImage}
						ref = "canoe" hp = {this.props.canoeHP} crewSize = {this.props.crewSize}
					/>
				</div>
			</div>
		);
	}
});

const Question = React.createClass({
	render() {
		return (
			<h2 id="question">{this.props.text}</h2>
		);
	}
});

const QuestionTimebar = React.createClass({
	getInitialState() {
		return {
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now()
		};
	},

	componentDidMount() {
		setInterval(() => {
			if (this.props.keepRunning) this.updateTime();
		}, 50);
	},

	updateTime() {
		if (this.props.keepRunning) {
			const currentTime = Date.now();
			const timeLeft = this.props.timePerQuestion - currentTime + this.state.timeStart;
			if (timeLeft < 0) {
				this.props.onTimeout();
			} else {
			this.setState({timeLeft});
			}
		}
	},

	reset() {
		this.setState({
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now()
		});
	},

	render() {
		const style = {
			width: (this.state.timeLeft / this.props.timePerQuestion * 100).toString() + '%',
			backgroundColor: '#26A65B',
			height: '5%'
		};
		return <div style={style} className="questionTime"></div>;
	}
});

const GameTimer = React.createClass({
	propTypes: {
		onFinish: React.PropTypes.func
	},
	getInitialState() {
		return {
			time: '',
			finished: false,
			timeStart: Date.now()
		};
	},
	zeroPad(t) {
		if (t < 10) return '0' + t;
		return t;
	},

	updateTimer() {
		const currentTime = Date.now();
		const ms = this.props.totalTime - currentTime + this.state.timeStart + 1000;
		let t = '';
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

	componentDidMount() {
		setInterval(() => {
			if (!this.state.finished) {
				this.updateTimer();
			}
		}, 50);
	},

	render() {
		return <p hidden={this.state.finished}>Time remaining: {this.state.time}</p>;
	}
});

const Rock = React.createClass({
	getInitialState() {
		return {
			x: null,
			height: null
		};
	},

	componentDidMount() {
		this.setState({
			width: this.refs.rock.offsetWidth,
			parentWidth: this.refs.rock.parentElement.clientWidth,
			height: this.refs.rock.offsetHeight
		});
	},

	render() {
		let x;
		if (this.state.width) {
			x = this.state.parentWidth / 2 - this.state.width / 2;
		}
		const style = {
			transform: `translate(${x}px, ${this.props.y}px)`,
			width: '10%'
		};
		return (
			<div style = {style} ref = "rock">
				<img src = "../img/obstacles/rock.svg" ></img>
			</div>
		);
	}
	// rock slowly approaches
});

const WhirlpoolFree = React.createClass({
	getInitialState() {
		return {
			tapStreak: 0
		};
	},
	processTap() {
		this.setState({tapStreak: this.state.tapStreak + 1});
		if (this.state.tapStreak == 5) {
			console.log("YOU GO!");
			this.props.socket.send(JSON.stringify({
				event: 'whirlpoolFiveTapsDetected'
			}));
			this.setState({tapStreak: 0});
		}
	},
	render() {
		return (
			<div className="modal modal-active panel-group">
				<div className="row">
					<div className="twelve columns panel">
						<h1><strong>Tap!</strong></h1>
						<p>For every tap, you give your friend a bit more time to answer the challenge question.</p>
						<button className="tap-button" onClick = {this.processTap}>GO</button>
					</div>
				</div>
			</div>
		);
	}
});

const WhirlpoolQuestion = React.createClass({
	getInitialState() {
		return {
			answers: null
		};
	},
	componentWillMount() {
		this.preprocessAnswers();
	},
	processAnswer(answer) {
		this.props.socket.send({
			event: 'whirlpoolAnswerSelected',
			answer
		});
	},
	preprocessAnswers() {
		let answers = [this.props.question.answer];
		this.props.question.incorrectAnswers.forEach(function(thing) {
			answers.push(thing);
		});
		answers = shuffle(answers);
		this.setState({answers});
	},
	render() {
		let answers = this.state.answers;
		return (
			<div className="modal-active whirlpool panel-group">
				<div className="panel-top">
					<h1><strong>Challenge</strong></h1>
					<h4 className="whirlpool-question">{this.props.question.text}</h4>
				</div>
				{this.props.timebar}
				{
					answers.map(function(answer) {
						return <button className="whirlpool-button u-full-width" onClick={this.processAnswer.bind(this, answer)}>{answer}</button>;
					})
				}
			</div>
		);
	}

	// popup - everything stops
	// one person gets a challenge question - multiple choice
	// timebar starts from 5 seconds
	// incorrect answer = time up
	// HP goes down by 25%
	// 10 % decrement for incorrect answers normally
	// for every 10 clicks, the timebar gets a 1 second boost
	// if correct answer for Whirlpool
	// increment by 5x correct questions
});

const RiverReflectionGroup = React.createClass({
	getInitialState() {
		const lighterColor = '#C1E4EB';
		const darkerColor = '#0068A0';
		return {
			numberOfReflections: Math.floor(2 + 2 * Math.random()),
			backgroundColor: Math.random() < 0.5 ? lighterColor : darkerColor,
			height: 25 + Math.random() * 10
		};
	},

	render() {
		const riverReflections = [];
		for (let i = 0; i < this.state.numberOfReflections; i++) {
			riverReflections.push(<RiverReflection
				backgroundColor = {this.state.backgroundColor}
				riverWidth = {this.props.riverWidth}
				height = {this.state.height}
				width = {100 / this.state.numberOfReflections}
				xOffset = {-i}
				key = {i}
			/>);
		}

		const style = {
			transform: `translate(${this.props.x}px, ${this.props.y}px)`,
			height: `${this.state.height}%`,
			width: `${this.state.numberOfReflections * 4}%`,
			zIndex: '-10',
			position: 'absolute'
		};
		return (
			<div style = {style}>
				{riverReflections}
			</div>
		);
	}
});

const RiverReflection = React.createClass({
	getInitialState() {
		return {
			height: 80 + Math.random() * 20,
			yOffset: (2 + Math.random() * 3) * this.props.riverWidth / 100
		};
	},

	render() {
		const style = {
			backgroundColor: this.props.backgroundColor,
			display: 'block',
			float: 'left',
			borderRadius: "10000000px",
			height: `${this.state.height}%`,
			transform: `translate(${this.props.xOffset}px, ${this.state.yOffset}px)`,
			width: `${this.props.width}%`
		};
		return <div style={style}></div>;
	}

	// 2 - 4 groups on screen at a time
	// 2  - 3 in teach groups
	// more lighter than darker
	// make them offsetWidth
	// if 3, two should be at least the same
});