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
			canoePosition: 0,
			canoeBounds: {
				left: 0.48,
				right: 0.52
			},
			// Rock
<<<<<<< HEAD
			rock: false
=======
			rock: false,
			rockPosition: 0
>>>>>>> master
		};
	},

	componentWillMount() {
		setInterval(() => {
			// MARK: add checking for relooping
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
		}, 2500);
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
			canoeBounds={this.state.canoeBounds}
			passedThreshold={this.answerPassedThreshold}
		/>);
	},

	answerPassedThreshold(answerText) {
		this.props.socket.send(JSON.stringify({
			event: 'answerPassedThreshold',
			answer: answerText,
			crewNumber: this.props.crewNumber
		}));
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

	addRock() {
<<<<<<< HEAD
		this.setState({
			rock: true
		});
=======
		const timeBeforeHit = 20000;
		this.setState({rock: true});

		setTimeout(() => {
			this.rockHit();
		}, timeBeforeHit);

		setInterval(() => {
			rockPosition += innerHeight / 20;
		}, 50);
	},

	rockHit() {
		alert("rock hit!");
	},

	endRock() {
		this.setState({rock: false});
		alert("saved from rock");
>>>>>>> master
	},

	render() {
		// MARK: add flashing
		const timePerQuestion = this.state.rock ? 10000 : 15000;

		return (
			<div className="container" hidden={this.state.gameFinished}>
				<div className="panel-group">
					<div className="panel-top">
						<GameTimer onFinish={this.gameTimerOver} totalTime={900000} />
						<Question text={this.state.questionText} />
					</div>
					<div className="panel-bottom">
						<QuestionTimebar onTimeout={this.questionTimeout} timePerQuestion={timePerQuestion} ref="questionTimebar"></QuestionTimebar>
					</div>
				</div>
				<River
  position={this.state.canoePosition}
  initialImage="../img/canoetop.svg"
  answersDisplayed={this.state.answers}
	rock={this.state.rock}
<<<<<<< HEAD
=======
	rockPosition = {this.state.rockPosition}
>>>>>>> master
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
				x: this.props.initialX,
				y: initialY
			},
			velocity: {
				vx,
				vy
			},
			disappeared: false,
			hasCrossedThreshold: false
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
		}, function() {
			this.animate(new Date());
		});
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
			return <span style={style} onClick={this.handleClick} ref = "answer">{this.props.text}</span>;
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
		// shake 0.82s cubic-bezier(.36,.07,.19,.97) both
		const style = {
		};
		return (<img id = "canoe" src = {this.state.image} style = {style}></img>);
	}
});

const River = React.createClass({
	render() {
		return (
			<div className="river">
			<Canoe position={this.props.position} initialImage={this.props.initialImage} />
				<div className="answers">
					{this.props.answersDisplayed}
				</div>
<<<<<<< HEAD
				{this.props.rock ? <Rock /> : undefined}
=======
				{this.props.rock ? <Rock
					x = {innerWidth / 2}
					y = {this.props.rockPosition}/> : undefined}
>>>>>>> master
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

const Rock = React.createClass({
	render() {
		const style = {
			transform: `translate($(this.props.x) px, $(this.props.y) px)`,
			width: '10em'
		};
		return <img src = "img/rock.svg" style = {style}></img>;
	}
	// rock slowly approaches
});

const Whirlpool = React.createClass({
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