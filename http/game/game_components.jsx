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
			// Whirlpool
			whirlpool: false,
			whirlpoolType: 'Free',
			whirlpoolQuestion: {},
			whirlpoolTimebar: null,
			whirlpoolBonus: 0,
			canoeHP: 100,
			canoeTopPosition: null,
			canoeHeight: null,
			// River Reflections
			reflectionGroupUpdate: null
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
		this.setState({reflectionGroupUpdate: Date.now()});
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
		this.refs.river.addRock(rockStartTime);
	},

	endRock() {
		this.refs.river.endRock();
	},

	rockHit() {
		this.props.socket.send(JSON.stringify({event: 'rockHit'}));
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
						<QuestionTimebar onTimeout={this.questionTimeout} timePerQuestion={timePerQuestion} ref="questionTimebar" keepRunning={!this.state.whirlpool}></QuestionTimebar>
					</div>
				</div>
				<River ref = "river"
					initialAnswers = {this.props.initialAnswers}
					answerSelected = {this.answerSelected}
					answerPassedThreshold = {this.answerPassedThreshold}
					canoeHP = {this.state.canoeHP}
					crewSize = {this.props.crewSize}
					reflectionGroupUpdate = {this.state.reflectionGroupUpdate}
					updateHP = {this.updateHP}
					rockHit = {this.rockHit}
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
		if (positionY > this.props.riverBounds.bottom - this.props.riverBounds.top) {
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

	getBounds() {
		return this.refs.canoe.getBoundingClientRect();
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

		const canoeStyle = {
			height: '100%'
		};
		const containerStyle = {
			textAlign: "center",
			height: '50%',
			margin: "0 auto",
			transform: `translate(0px, ${window.innerHeight / 3.5}px)`,
			display: 'inline-block'
		};

		return (
			<div style = {containerStyle}>
				<img id = "canoe" src = {image} style = {canoeStyle} ref = "canoe"></img>
			</div>
		);
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
			riverHeight: null,
			flashClass: "",
			// Rock
			rockStartTime: false,
			rockAnimation: null,
			rockYPosition: -window.innerHeight * 0.1
		};
	},

	componentDidMount() {
		// Constants
		const river = this.refs.river;
		const riverRect = river.getBoundingClientRect();
		const canoe = ReactDOM.findDOMNode(this.refs.canoe);
		const canoeRect = canoe.getBoundingClientRect();
		const rockHeight = ReactDOM.findDOMNode(this.refs.rock).offsetHeight;
		// River Reflections
		this.setState({riverWidth: river.offsetWidth});
		this.startRiverReflections();
		// Answers
		this.updateAnswers();
		setInterval(this.updateAnswers, 2500);
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

		let newAnswer = answersToAdd.shift();
		if (newAnswer && currentAnswers.indexOf(newAnswer) < 0) {
			this.setState({answersToAdd});
		} else {
			if (newAnswer) answersToAdd.unshift(newAnswer);
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

	addRock(rockStartTime) {
		sweetAlert({
			title: "Rock approaching!",
			text: "Answer questions quickly to avoid being hit!",
			imageUrl: "../img/obstacles/rock.svg",
			timer: 2500,
			showConfirmButton: false
		}, () => {
			sweetAlert.close();
			const rockAnimation = requestAnimationFrame(this.animateRock);
			this.setState({rockStartTime, rockAnimation, rockLastAnimationTime: rockStartTime});
		});
	},

	animateRock(timestamp) {
		if (!this.state.rockStartTime) return;
		const currentTime = Date.now();
		const timeFromStart = (currentTime - this.state.rockStartTime) / 1000;
		const timeFromLast = (currentTime - this.state.rockLastAnimationTime) / 1000;
		const timeUntilImpact = 25;
		const rock = ReactDOM.findDOMNode(this.refs.rock);
		const canoeBounds = this.refs.canoe.getBounds();
		const impactDistance = canoeBounds.top - this.riverBounds().top - rock.offsetHeight;
		if (timeFromStart > 0 && timeFromStart < timeUntilImpact) {
			const distanceToGo = impactDistance - this.state.rockYPosition;
			const impactVelocity = distanceToGo / (timeUntilImpact - timeFromStart);
			const rockYPosition = this.state.rockYPosition + timeFromLast * impactVelocity;
			if (rockYPosition > impactDistance) {
				cancelAnimationFrame(this.state.rockAnimation);
				this.rockHit();
			} else {
				this.setState({rockYPosition, rockLastAnimationTime: currentTime});
			}
		} else if (timeFromStart > timeUntilImpact) {
			cancelAnimationFrame(this.state.rockAnimation);
			this.setState({rockYPosition: impactDistance});
			this.rockHit();
		}
		this.setState({rockAnimation: requestAnimationFrame(this.animateRock)});
	},

	rockHit() {
		this.setState({
			rockStartTime: null,
			rockAnimation: null,
			rockYPosition: -innerHeight * 0.1
		});
		this.flashRedTwice();
		this.props.updateHP(this.props.canoeHP - 30);
		this.props.rockHit();
	},

	endRock() {
		this.setState({
			rockStartTime: null,
			rockAnimation: null,
			rockYPosition: -innerHeight * 0.1
		});
		sweetAlert("Congratulations! You were saved from the rock.", "success");
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
		const initialReflectionCount = Math.floor(4 + Math.random() * 2);
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
		const riverBounds = this.riverBounds();
		const riverHeight = riverBounds.bottom - riverBounds.top;
		const updateTimeDifference = Date.now() - this.props.reflectionGroupUpdate;
		this.setState((previousState, previousProps) => {
			const currentGroups = previousState.riverReflectionGroups;
			const currentTime = Date.now();
			const timeSinceLastAnimation = currentTime - previousState.lastAnimationTime;
			let hasBottomReflectionGroup = false;
			let hasTopReflectionGroup = false;
			for (let i = 0; i < currentGroups.length; i++) {
				if (updateTimeDifference > 0 && updateTimeDifference < 1000) {
					if (this.props.HP > 0) {
						currentGroups[i].y += (timeSinceLastAnimation / 1000) *
							(riverHeight / Math.abs((300 - updateTimeDifference) / 500 + 2.5));
					} else {
						currentGroups[i].y += (timeSinceLastAnimation / 1000) *
							(riverHeight / Math.abs((300 - updateTimeDifference) / 500 + 3));
					}
				} else {
					currentGroups[i].y -= (timeSinceLastAnimation / 1000) * (riverHeight / 40);
				}
				if (currentGroups[i].y > riverHeight) {
					hasBottomReflectionGroup = true;
				} else if (currentGroups[i].y < -riverHeight) {
					hasTopReflectionGroup = true;
				} else if (currentGroups[i].y < -2 * riverHeight) {
					this.removeReflectionGroup(currentGroups[i].x);
				} else if (currentGroups[i].y > riverHeight * 3) {
					this.removeReflectionGroup(currentGroups[i].x);
				}
			}
			if (!hasBottomReflectionGroup) {
				this.addReflectionGroup('bottom');
			}
			if (!hasTopReflectionGroup) {
				this.addReflectionGroup('top');
			}
			return {
				riverReflectionGroups: currentGroups,
				lastAnimationTime: currentTime
			};
		}, () => {
			requestAnimationFrame(this.updateRiverReflections);
		});
	},

	removeReflectionGroup(xPosition) {
		this.setState((previousState, previousProps) => {
			const currentGroups = previousState.riverReflectionGroups.slice();
			for (let currentGroup of currentGroups) {
				if (currentGroup.x == xPosition) {
					currentGroups.splice(currentGroups.indexOf(currentGroup), 1);
				}
			}
			return {riverReflectionGroups: currentGroups};
		});
	},

	addReflectionGroup(side) {
		function ascending(a, b) {return a - b;}

		const currentGroups = this.state.riverReflectionGroups.slice();
		if (side == 'bottom') currentGroups.sort((a, b) => b.y - a.y);
		else if (side == 'top') currentGroups.sort((a, b) => a.y - b.y);

		const riverBounds = this.riverBounds();
		const riverHeight = riverBounds.bottom - riverBounds.top;
		let currentXPositions = [0];

		currentXPositions = currentXPositions.concat(currentGroups.slice(0, 3).map(({x}) => x).sort(ascending));
		currentXPositions.push(riverBounds.right - riverBounds.left - this.refs.river.offsetWidth * 0.15);

		const newXPosition = this.findMaximumGap(currentXPositions);
		let newYPosition;
		if (side == 'bottom') newYPosition = currentGroups[0].y + riverHeight / (1.5 + Math.random());
		else if (side == 'top') newYPosition = currentGroups[0].y - 2 * riverHeight / (2.5 + Math.random());

		this.setState((previousState, previousProps) => {
			const riverReflectionGroups = previousState.riverReflectionGroups;
			riverReflectionGroups.push({x: newXPosition, y: newYPosition, key: newXPosition});
			return {riverReflectionGroups};
		});
	},

	generateAnswerPosition(answerWidth) {
		const riverBounds = this.riverBounds();
		const canoeBounds = this.refs.canoe.getBounds();

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
		currentPositions.left.sort(ascending);
		currentPositions.right.sort(ascending);

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
		const currentAnswers = this.state.answers;
		const incorrectAnswers = [];
		const incorrectAnswersToAdd = Math.floor(Math.random() * 1.5);
		for (let i = 0; i < incorrectAnswersToAdd; i++) {
			let randomData = this.state.answerData[Math.floor(Math.random() * this.state.answerData.length)];
			while (currentAnswers.indexOf(randomData) >= 0 || incorrectAnswers.indexOf(randomData) >= 0 || oldAnswersToAdd.indexOf(randomData) >= 0) {
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
				keepRunning={!this.props.whirlpool}
			/>);
		}
		return (
			<div className={"river" + this.state.flashClass} ref = "river">
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
					<Rock y = {this.state.rockYPosition} ref = "rock"/>
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
			height: '100%'
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
	render() {
		const rockStyle = {
			height: "100%"
		};
		const containerStyle = {
			textAlign: "center",
			height: "12%",
			margin: "0 auto",
			transform: `translate(0px, ${this.props.y}px)`,
			display: 'inline-block'
		};
		return (
			<div style={containerStyle}>
				<img src = "../img/obstacles/rock.svg" style = {rockStyle}></img>
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
			maxWidth: `${this.state.numberOfReflections * 20}px`,
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