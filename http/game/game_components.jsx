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
			canoeHP: 100,
			canoeTopPosition: null,
			canoeHeight: null,
			// River
			riverTopPosition: null,
			flashClass: "",
			// Rock
			rock: false,
			rockYPosition: -window.innerHeight * 0.2,
			rockHeight: null,
			rockStartTime: null,
			rockAnimation: null,
			// Whirlpool
			whirlpool: false
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

	initiateWhirlpoolTap() {
		this.setState({
			whirlpool: true
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
		this.setState((previousState, previousProps) => (
			{
				canoeHP: previousState.canoeHP - 5
			}
		));
	},

	addCorrectAnswer(answer) {
		// add a random number of wrong answers before correct answer
		this.refs.river.addCorrectAnswer(answer);
	},

	questionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'questionTimeout',
			crewNumber: this.props.crewNumber,
			question: this.state.questionText
		}));
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
		const timeDifference = (new Date().getTime() - this.state.rockStartTime) / 1000;
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
		const timePerQuestion = this.state.rock ? 10000 : 15000;
		return (
			<div className="container" hidden={this.state.gameFinished}>
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
				x: this.props.generateAnswerPosition(),
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
		const timeAtAnimation = (new Date()).getTime();
		const dt = timeAtAnimation - this.state.lastAnimationTime;

		const leftBoundary = this.props.canoeBounds.left;
		const rightBoundary = this.props.canoeBounds.right;

		let positionX = this.state.position.x;
		let positionY = this.state.position.y;
		let velocityX = this.state.velocity.vx;
		let velocityY = this.state.velocity.vy;
		let offsetWidth = this.state.offsetWidth;

		// ugly physics code beware
		if ((positionX) + offsetWidth / 2 < innerWidth / 2) {
			velocityX += (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-(positionX)) / 100) - Math.min(0.001, Math.exp((positionX) + offsetWidth - innerWidth * leftBoundary) / 100)) || 0);
		} else {
			velocityX += (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-(positionX) + innerWidth * rightBoundary) / 100) - Math.min(0.001, Math.exp((positionX) + offsetWidth - innerWidth) / 100)) || 0);
		}
		velocityX /= 1.05;

		velocityY += dt * ((Math.random() - 0.5) / 10000);
		if ((velocityY) < 0.03) velocityY = +velocityY + 0.03;

		positionX += (velocityX) * dt;
		positionY += (velocityY) * dt;

		if (positionY > this.props.riverBottomBound) {
			this.props.answerPassedThreshold(this.props.text);
			window.cancelAnimationFrame(this.state.positionAnimation);
		}

		this.setState({
			position: {x: positionX, y: positionY},
			velocity: {vx: velocityX, vy: velocityY},
			lastAnimationTime: timeAtAnimation
		});
	},

	componentDidMount() {
		const currentTime = (new Date()).getTime();
		this.setState({
			startTime: currentTime,
			lastAnimationTime: currentTime,
			offsetWidth: this.refs.answer.offsetWidth
		}, () => {
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
			this.setState({
				positionAnimation: window.requestAnimationFrame(this.animate)
			});
		}
	},

	render() {
		const style = {
			transform: 'translate(' + this.state.position.x + 'px, ' + this.state.position.y + 'px)'
		};
		if (!this.state.disappeared)
			return <span style={style} onClick={this.handleClick} ref = "answer">{this.props.text}</span>;
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
			width: '25%',
			transform: `translate(${0}px, ${window.innerHeight / 3.5}px)`
		};
		return (<img id = "canoe" src = {image} style = {style} ref = "canoe"></img>);
	}
});

const River = React.createClass({
	getInitialState() {
		return {
			// Canoe
			canoeHeight: null,
			canoeBounds: {
				left: 0.42,
				right: 0.58
			},
			// Answers
			answers: [],
			answersToAdd: [],
			answersToRemove: [],
			answerData: this.props.initialAnswers,
			initialAnswerXPositions: []
		};
	},

	answerPassedThreshold(answerText) {
		this.props.answerPassedThreshold(answerText);
		let answersToRemove = this.state.answersToRemove;
		const removalIndex = answersToRemove.indexOf(answerText);
		if (removalIndex <= -1) {
			answersToRemove = answersToRemove.concat(answerText);
		}
		this.setState({answersToRemove});
	},

	updateAnswers() {
		const currentAnswers = this.state.answers;
		const answersToAdd = this.state.answersToAdd;
		const answersToRemove = this.state.answersToRemove;
		if (answersToRemove.length > 0) {
			const removalIndex = currentAnswers.indexOf(answersToRemove.shift());
			currentAnswers.splice(removalIndex, 1);
			this.setState((previousState, previousProps) => (
			{
				answersToRemove: previousState.answersToRemove.splice(0, 1)
			}
		));
		}

		if (answersToAdd.length > 0) {
			currentAnswers.push(answersToAdd.shift());
			this.setState({answersToAdd});
		} else {
			let randomData = this.state.answerData[Math.floor(
				Math.random() * this.state.answerData.length)];
			while (randomData in currentAnswers) {
				randomData = this.state.answerData[Math.floor(
					Math.random() * this.state.answerData.length)];
			}
			currentAnswers.push(randomData);
		}
		this.setState({
			answers: currentAnswers
		});
	},

	componentDidMount() {
		const riverTopPosition = this.refs.river.getBoundingClientRect().top;
		const riverBottomPosition = this.refs.river.getBoundingClientRect().bottom;
		const canoe = ReactDOM.findDOMNode(this.refs.canoe);
		const canoeTopPosition = canoe.getBoundingClientRect().top;
		const canoeLeftPosition = canoe.getBoundingClientRect().left;
		const canoeRightPosition = canoe.getBoundingClientRect().right;
		const canoeHeight = ReactDOM.findDOMNode(this.refs.canoe).offsetHeight;
		const rockHeight = ReactDOM.findDOMNode(this.refs.rock).offsetHeight;
		this.props.rockAnimationData(riverTopPosition, canoeTopPosition, canoeHeight, rockHeight);
		this.setState({
			canoeBounds: {
				left: canoeLeftPosition,
				right: canoeRightPosition
			},
			bottomBound: riverBottomPosition
		});
		this.updateAnswers();
		setInterval(this.updateAnswers, 5000);
	},

	generateAnswerPosition() {
		const answerSpawnLeftBoundary = innerWidth * -0.1;
		const answerSpawnRightBoundary = innerWidth * 0.65;
		let newLeftBound = answerSpawnLeftBoundary;
		let newRightBound = answerSpawnRightBoundary;
		let topmostXPositions = this.state.initialAnswerXPositions.slice().reverse().slice(0, 2);
		let initialXPositions = this.state.initialAnswerXPositions;
		let currentMaximumGap = 0;

		function sortAscending(a, b) {return a - b;}

		let currentXPositions = [newLeftBound].concat(topmostXPositions.slice().sort(sortAscending))
			.concat([newRightBound]).sort(sortAscending);
		for (let i = 1; i < initialXPositions.length; i++) {
			const currentGap = initialXPositions[i] - initialXPositions[i - 1];
			if (currentGap > currentMaximumGap) {
				currentMaximumGap = currentGap;
				newLeftBound = currentXPositions[i - 1];
				newRightBound = currentXPositions[i];
			}
		}
		newLeftBound += currentMaximumGap * 0.25;
		newRightBound -= currentMaximumGap * 0.25;
		const newPosition = newLeftBound + Math.random() * (newRightBound - newLeftBound);
		initialXPositions.push(newPosition);
		this.setState({initialAnswerXPositions: initialXPositions});
		return newPosition;
	},

	addCorrectAnswer(answer) {
		const oldAnswersToAdd = this.state.answersToAdd;
		const incorrectAnswers = [];
		const incorrectAnswersToAdd = Math.floor(Math.random() * 2);
		for (let i = 0; i < incorrectAnswersToAdd; i++) {
			const randomData = this.state.answerData[Math.floor(Math.random() * this.state.answerData.length)];
			incorrectAnswers.push(randomData);
		}
		const currentAnswersToAdd = oldAnswersToAdd.concat(incorrectAnswers);
		currentAnswersToAdd.push(answer);

		this.setState({
			answersToAdd: currentAnswersToAdd
		});
	},

	render() {
		return (
			<div className={"river" + this.props.flashClass} ref = "river">
				<div className="answers">
					{this.state.answers.map((answer) =>
						<Answer
							text={answer}
							onClick={this.props.answerSelected}
							answerPassedThreshold={this.answerPassedThreshold}
							generateAnswerPosition={this.generateAnswerPosition}
							riverBottomBound={this.state.bottomBound}
							canoeBounds={this.state.canoeBounds}
							keepRunning={!this.props.whirlpool}
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
			timeStart: (new Date()).getTime()
		};
	},

	componentDidMount() {
		setInterval(() => {
			if (this.props.keepRunning) this.updateTime();
		}, 50);
	},

	updateTime() {
		const currentTime = (new Date()).getTime();
		const timeLeft = this.props.timePerQuestion - currentTime + this.state.timeStart;
		if (timeLeft < 0) {
			this.props.onTimeout();
		} else {
			this.setState({timeLeft});
		}
	},

	reset() {
		this.setState({
			timeLeft: this.props.timePerQuestion,
			timeStart: (new Date()).getTime()
		});
	},

	render() {
		const style = {
			width: (this.state.timeLeft / this.props.timePerQuestion * 100).toString() + '%',
			backgroundColor: '#26A65B',
			height: '5%'
		};
		return <div style={style} id="questionTime"></div>;
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
			timeStart: (new Date()).getTime()
		};
	},
	zeroPad(t) {
		if (t < 10) return '0' + t;
		return t;
	},

	updateTimer() {
		const currentTime = (new Date()).getTime();
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
				<img src = "img/obstacles/rock.svg" ></img>
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
			socket.trysend(JSON.stringify({
				event: 'fiveTapsDetected'
			}));
			this.setState({tapStreak: 0});
		}
	},
	render() {
		return (
			<div className="modal modal-active whirlpool">
				<div className="container">
					<div className="row">
						<div className="twelve columns">
							<h1><strong>Tap!</strong></h1>
							<p>For every tap, you help your friend out a bit.</p>
							<button className="tap-button" onClick = {this.processTap}>Send help</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

const WhirlpoolQuestion = React.createClass({
	getDefaultProps() {
		return {

		};
	},
	render() {
		return <img src={this.props.image}></img>;
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
