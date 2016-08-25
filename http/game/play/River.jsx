import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import ReactDOM from 'react-dom';
import Canoe from './Canoe.jsx';
import Rock from './Rock.jsx';
import RiverReflectionGroup from './RiverReflectionGroup.jsx';
import Answer from './Answer.jsx';

class River extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// Answers
			answers: [],
			answersToAdd: [],
			answersToRemove: [],
			initialAnswerXPositions: [],
			// River Reflections
			riverReflectionGroups: [],
			lastAnimationTime: null,
			// River
			riverWidth: null,
			riverHeight: null,
			flashClass: '',
			// Rock
			rockStartTime: false,
			rockAnimation: null,
			rockYPosition: -window.innerHeight * 0.1,
		};
		autoBind(this);
	}
	componentDidMount() {
		// River Reflections
		this.setRiverWidth();
		/* this.startRiverReflections();*/
		// Answers
		this.updateAnswers();
		let answerUpdate = setInterval(this.updateAnswers, 2500);
		window.addEventListener('focus', () => {
			answerUpdate = setInterval(this.updateAnswers, 2500);
		}, false);

		window.addEventListener('blur', () => {
			clearInterval(answerUpdate);
		}, false);
	}
	setRiverWidth() {
		const river = this.refs.river;
		this.setState({ riverWidth: river.offsetWidth });
	}
	answerPassedThreshold(answerText) {
		this.props.answerPassedThreshold(answerText);
		const answersToRemove = this.state.answersToRemove;
		const removalIndex = answersToRemove.indexOf(answerText);
		if (removalIndex <= -1) {
			answersToRemove.push(answerText);
		}
		this.setState({ answersToRemove });
	}
	updateAnswers() {
		const currentAnswers = this.state.answers;
		const answersToAdd = this.state.answersToAdd;
		const answersToRemove = this.state.answersToRemove;

		let newAnswer = answersToAdd.shift();
		if (newAnswer && currentAnswers.indexOf(newAnswer) < 0) {
			this.setState({ answersToAdd });
		} else {
			if (newAnswer) answersToAdd.unshift(newAnswer);
			let randomData = this.props.answerData[Math.floor(
				Math.random() * this.props.answerData.length)];
			while (currentAnswers.indexOf(randomData) >= 0) {
				randomData = this.props.answerData[Math.floor(
					Math.random() * this.props.answerData.length)];
			}
			newAnswer = randomData;
		}

		currentAnswers.push(newAnswer);

		if (answersToRemove.length > 0) {
			const removalIndex = currentAnswers.indexOf(answersToRemove.shift());
			currentAnswers.splice(removalIndex, 1);
			this.setState({ answersToRemove });
		}

		this.setState({
			answers: currentAnswers,
		});
	}
	wasCorrectAnswer(answer) {
		const answerIndex = this.props.answerData.indexOf(answer);
		this.refs[`${answerIndex}`].disappear();
	}
	wasIncorrectAnswer(answer) {
		const answerIndex = this.props.answerData.indexOf(answer);
		this.refs[`${answerIndex}`].shake();
	}
	addRock(rockStartTime) {
		/*
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
		*/
		const rockAnimation = requestAnimationFrame(this.animateRock);
		this.setState({ rockStartTime, rockAnimation, rockLastAnimationTime: rockStartTime });
	}
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
				this.setState({ rockYPosition, rockLastAnimationTime: currentTime });
			}
		} else if (timeFromStart > timeUntilImpact) {
			cancelAnimationFrame(this.state.rockAnimation);
			this.setState({ rockYPosition: impactDistance });
			this.rockHit();
		}
		this.setState({ rockAnimation: requestAnimationFrame(this.animateRock) });
	}
	rockHit() {
		this.setState({
			rockStartTime: null,
			rockAnimation: null,
			rockYPosition: -innerHeight * 0.1,
		});
		this.flashRedTwice();
		this.props.updateHP(this.props.canoeHP - 30);
		this.props.rockHit();
	}
	endRock() {
		this.setState({
			rockStartTime: null,
			rockAnimation: null,
			rockYPosition: -innerHeight * 0.1,
		});
		this.showUpdate('Congratulations!', 'You were saved from the rock.');
	}
	clearFlash() {
		setTimeout(() => {
			this.setState({
				flashClass: '',
			});
		}, 1000);
	}
	flashRedTwice() {
		this.setState({
			flashClass: ' flash-red-twice',
		}, this.clearFlash);
	}
	findMaximumGap(positions) {
		// find the best place to add a new element, given a list of positions
		let currentMaximumGap = 0;
		let newLeftBound;
		let newRightBound;
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
	}
	startRiverReflections() {
		const riverBounds = this.riverBounds();
		const riverHeight = riverBounds.bottom - riverBounds.top;
		const initialXPositions = [0, riverBounds.right - riverBounds.left - this.refs.river.offsetWidth * 0.15];
		const initialYPositions = [-riverHeight, riverHeight * 2];
		const initialReflectionCount = Math.floor(4 + Math.random() * 2);
		const riverReflectionGroups = [];
		function ascending(a, b) { return a - b; }

		for (const i of Array(initialReflectionCount).keys()) {
			const newXPosition = this.findMaximumGap(initialXPositions);
			const newYPosition = this.findMaximumGap(initialYPositions);
			initialXPositions.push(newXPosition);
			initialXPositions.sort(ascending);
			initialYPositions.push(newYPosition);
			initialYPositions.sort(ascending);
			riverReflectionGroups.push({
				x: newXPosition, y: newYPosition, key: newXPosition });
		}

		this.setState({ riverReflectionGroups, lastAnimationTime: Date.now() }, () => {
			requestAnimationFrame(this.updateRiverReflections);
		});
	}
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
				if (!hasBottomReflectionGroup && currentGroups[i].y > riverHeight) {
					hasBottomReflectionGroup = true;
				} else if (!hasTopReflectionGroup && currentGroups[i].y < -riverHeight) {
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
				lastAnimationTime: currentTime,
			};
		}, () => {
			requestAnimationFrame(this.updateRiverReflections);
		});
	}
	removeReflectionGroup(xPosition) {
		this.setState((previousState, previousProps) => {
			const currentGroups = previousState.riverReflectionGroups.slice();
			for (const currentGroup of currentGroups) {
				if (currentGroup.x === xPosition) {
					currentGroups.splice(currentGroups.indexOf(currentGroup), 1);
				}
			}
			return { riverReflectionGroups: currentGroups };
		});
	}
	addReflectionGroup(side) {
		function ascending(a, b) { return a - b; }

		const currentGroups = this.state.riverReflectionGroups.slice();
		if (side === 'bottom') currentGroups.sort((a, b) => b.y - a.y);
		else if (side === 'top') currentGroups.sort((a, b) => a.y - b.y);

		const riverBounds = this.riverBounds();
		const riverHeight = riverBounds.bottom - riverBounds.top;
		let currentXPositions = [0];

		currentXPositions = currentXPositions.concat(currentGroups.slice(0, 3).map(({ x }) => x).sort(ascending));
		currentXPositions.push(riverBounds.right - riverBounds.left - this.refs.river.offsetWidth * 0.15);

		const newXPosition = this.findMaximumGap(currentXPositions);
		let newYPosition;
		if (side === 'bottom') newYPosition = currentGroups[0].y + riverHeight / (1.5 + Math.random());
		else if (side === 'top') newYPosition = currentGroups[0].y - 2 * riverHeight / (2.5 + Math.random());

		this.setState((previousState, previousProps) => {
			const riverReflectionGroups = previousState.riverReflectionGroups;
			riverReflectionGroups.push({ x: newXPosition, y: newYPosition, key: newXPosition });
			return { riverReflectionGroups };
		});
	}
	generateAnswerPosition(answerWidth) {
		const riverBounds = this.riverBounds();
		const canoeBounds = this.refs.canoe.getBounds();

		// answers should spawn between screenleft and canoeleft or screenright and canoeright
		const screenLeft = 0;
		const canoeLeft = canoeBounds.left - riverBounds.left - answerWidth;
		const canoeRight = canoeBounds.right - riverBounds.left;
		const screenRight = riverBounds.right - riverBounds.left - answerWidth;

		function ascending(a, b) { return a - b; }

		const topmostXPositions = this.state.initialAnswerXPositions.slice().reverse().slice(0, 2).sort(ascending);
		const currentPositions = {
			left: [screenLeft],
			right: [canoeRight],
		};

		for (const topmostXPosition of topmostXPositions) {
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
		let newLeftBound;
		let newRightBound;

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
			{ initialAnswerXPositions: previousState.initialAnswerXPositions.concat([newPosition]) }
		));
		return newPosition;
	}
	addCorrectAnswer(answer) {
		const oldAnswersToAdd = this.state.answersToAdd;
		const currentAnswers = this.state.answers;
		const incorrectAnswers = [];
		const incorrectAnswersToAdd = Math.floor(Math.random() * 1.5);
		for (let i = 0; i < incorrectAnswersToAdd; i++) {
			let randomData = this.props.answerData[Math.floor(Math.random() * this.props.answerData.length)];
			while (currentAnswers.indexOf(randomData) >= 0
				|| incorrectAnswers.indexOf(randomData) >= 0
				|| oldAnswersToAdd.indexOf(randomData) >= 0) {
				randomData = this.props.answerData[Math.floor(Math.random() * this.props.answerData.length)];
			}
			incorrectAnswers.push(randomData);
		}
		const currentAnswersToAdd = oldAnswersToAdd.concat(incorrectAnswers);
		currentAnswersToAdd.push(answer);

		this.setState({
			answersToAdd: currentAnswersToAdd,
		});
	}
	riverBounds() {
		const river = this.refs.river;
		return river.getBoundingClientRect();
	}
	render() {
		let answers = [];

		for (let i = 0; i < this.state.answers.length; i++) {
			answers.push(<Answer
				text={this.state.answers[i]}
				key={this.props.answerData.indexOf(this.state.answers[i])}
				onClick={this.props.answerSelected}
				answerPassedThreshold={this.answerPassedThreshold}
				generateAnswerPosition={this.generateAnswerPosition}
				riverBounds={this.riverBounds()}
				keepRunning={!this.props.whirlpool}
				ref={`${this.props.answerData.indexOf(this.state.answers[i])}`}
			/>);
		}
		return (
			<div className={'river' + this.state.flashClass} ref="river">
				<div className="answers">
					{answers}
					{/* {this.state.riverReflectionGroups.map((riverReflectionGroup) =>
						<RiverReflectionGroup
							x={riverReflectionGroup.x}
							y={riverReflectionGroup.y}
							riverWidth={this.state.riverWidth}
							key={riverReflectionGroup.key}
						/>
					)}*/}
					<Rock y={this.state.rockYPosition} present={this.props.rockPresent} ref="rock" />
					<Canoe
						initialImage={this.props.initialImage} ref="canoe"
						hp={this.props.canoeHP} crewSize={this.props.crewSize}
					/>
				</div>
			</div>
		);
	}
}

export default River;
