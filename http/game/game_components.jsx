import React from 'react';

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
			// Answer
			answers: [],
			answersToAdd: [],
			answerData: this.props.initialAnswers,
			answerPositions: {},
			// Canoe
			canoePosition: 0
		};
	},

	componentWillMount() {
		setInterval(() => {
			const currentAnswers = this.state.answers;
			/* KEEP THIS COMMENTED OUT
			for (let currentAnswer in currentAnswers) {
				if (currentAnswer.state.position.y > innerHeight) {
					currentAnswers.remove(currentAnswer);
				}
			}*/
			const answersToAdd = this.state.answersToAdd;
			if (answersToAdd.length > 0) {
				currentAnswers.push(this.generateAnswerComponent(answersToAdd.shift()));
				this.setState({answersToAdd});
			} else {
				const randomData = this.state.answerData[Math.floor(
					Math.random() * this.state.answerData.length)];
				if (!(randomData in currentAnswers)) {
					currentAnswers.push(this.generateAnswerComponent(randomData));
				}
			}
			this.setState({
				answers: currentAnswers
			});
		}, 2000);
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

	generateAnswerComponent(answer) {
		return (<Answer
  text={answer}
  onClick={this.answerSelected.bind(this, answer)}
  initialX={this.generateAnswerPosition()}
  />);
	},

	generateAnswerPosition() {
		const answerSpawnLeftBoundary = innerWidth * -0.1;
		const answerSpawnRightBoundary = innerWidth * 0.65;
		let newLeftBound = answerSpawnLeftBoundary;
		let newRightBound = answerSpawnRightBoundary;
		let currentXPositions = [];
		let currentMaximumGap = 0;
		for (let i = 0; i < 2; i++) {
			const oneOfTopmostAnswers = this.state.answers.slice().reverse()[i];
			if (oneOfTopmostAnswers) {
				currentXPositions.push(oneOfTopmostAnswers.props.initialX);
			}
		}

		function sortAscending(a, b) {
			return a - b;
		}

		currentXPositions = [newLeftBound].concat(currentXPositions.sort(sortAscending))
			.concat([newRightBound]).sort(sortAscending);
		for (let i = 1; i < currentXPositions.length; i++) {
			const currentGap = currentXPositions[i] - currentXPositions[i - 1];
			if (currentGap > currentMaximumGap) {
				currentMaximumGap = currentGap;
				newLeftBound = currentXPositions[i - 1];
				newRightBound = currentXPositions[i];
			}
		}
		newLeftBound += currentMaximumGap * 0.25;
		newRightBound -= currentMaximumGap * 0.25;
		return newLeftBound + Math.random() * (newRightBound - newLeftBound);
	},

	correctAnswer() {
		// MARK: correct answer animation

	},

	incorrectAnswer() {
		// MARK: incorrect answer animation
	},

	newQuestion(question) {
		this.setState({
			questionText: question
		});
		this.refs.questionTimebar.reset();
	},

	addCorrectAnswer(answer) {
		// add a random number of wrong answers before correct answer

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

	questionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'questionTimeout',
			crewNumber: this.props.crewNumber,
			question: this.state.questionText
		}));
	},

	render() {
		// MARK: add flashing
		return (
			<div className="container" hidden={this.state.gameFinished}>
				<div className="panel-group">
					<div className="panel-top">
						<GameTimer onFinish={this.gameTimerOver} totalTime={900000} />
						<Question text={this.state.questionText} />
					</div>
					<div className="panel-bottom">
						<QuestionTimebar onTimeout={this.questionTimeout} timePerQuestion={10000} ref="questionTimebar"></QuestionTimebar>
					</div>
				</div>
				<River
  position={this.state.canoePosition}
  initialImage="../assets/canoe/canoe_full_health.png"
  answersDisplayed={this.state.answers}
    />
      </div>
    );
	}
});

const Answer = React.createClass({
	getInitialState() {
		let initialY = Math.random() * 100 - 100;
		return {
			position: {
				x: this.props.initialX,
				y: initialY
			},
			velocity: {
				vx: 0,
				vy: 50 + Math.random() * 20
			},
			disappeared: false,
			hasCrossedThreshold: false,
			initialPosition: {
				x: this.props.initialX,
				y: initialY
			}
		};
	},

	setPosition() {
		const timeAtAnimation = (new Date()).getTime();
		const timeSinceStart = timeAtAnimation - this.state.startTime;
		const newX = this.state.initialPosition.x + this.state.velocity.vx * timeSinceStart / 1000;
		const newY = this.state.initialPosition.y + this.state.velocity.vy * timeSinceStart / 1000;
		this.setState({
			position: {x: newX, y: newY}
		});
	},

	componentDidMount() {
		this.setState({
			startTime: (new Date()).getTime()
		});
		this.animate(new Date());
	},

	handleClick() {
		this.setState({
			disappeared: true
		});
		this.props.onClick();
	},

	animate(timestamp) {
		this.setPosition();
		window.requestAnimationFrame(this.animate);
	},

	render() {
		const style = {
			transform: 'translate(' + this.state.position.x + 'px, ' + this.state.position.y + 'px)'
		};
		if (!this.state.disappeared)
			return <span style={style} onClick={this.handleClick}>{this.props.text}</span>;
		else {
			return null;
		}
	}
});

const Canoe = React.createClass({
	getInitialState() {
		return {
			hp: 100,
			image: this.props.initialImage
		};
	},
	render() {
		return (null);
		/* (<img id = "canoe" src = {this.state.image}></img>)*/
	}
});

const River = React.createClass({
	getInitialState() {
		return {
			image: <img></img>
		};
	},
	render() {
		return (
			<div className="river">
			<Canoe position={this.props.position} initialImage={this.props.initialImage} />
				<div className="answers">
					{this.props.answersDisplayed}
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
			this.updateTime();
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
			height: '20px'
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
export default Game;
