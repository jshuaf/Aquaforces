import React, { Component, PropTypes } from 'react';

class Game extends Component {
	constructor(props) {
		super(props);
		this.state = {
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
			rock: false,
			canoeHP: 100,
			canoeTopPosition: null,
			canoeHeight: null,
			// River Reflections
			reflectionGroupUpdate: null,
			update: null,
		};
	}
	answerSelected(answerText) {
		this.props.socket.send(JSON.stringify({
			event: 'answerSelected',
			answer: answerText,
			username: this.props.username,
			crewNumber: this.props.crewNumber,
		}));
	}
	showUpdate(title, text) {
		this.setState({ update: <Update title={title} text={text} animationText="bounceindown animated"></Update> });
		const rock = this;
		setTimeout(function () {
			this.setState({ update: <Update title={title} text={text} animationText="bounceoutup animated"></Update> });
		}.bind(rock), 2500);
	}
	gameTimerOver() {
		this.setState({
			gameFinished: true,
		});
	}
	addWhirlpoolTap() {
		this.setState({
			whirlpool: true,
			whirlpoolType: 'Free',
		});
	}
	addWhirlpoolQuestion(question) {
		this.setState({
			whirlpool: true,
			whirlpoolType: 'Question',
			whirlpoolQuestion: question,
		});
	}
	answerPassedThreshold(answerText) {
		this.props.socket.send(JSON.stringify({
			event: 'answerPassedThreshold',
			answer: answerText,
			crewNumber: this.props.crewNumber,
		}));
	}
	newQuestion(question) {
		this.setState({
			questionText: question,
		});
		this.refs.questionTimebar.reset();
	}
	correctAnswer(answer) {
		this.setState({ reflectionGroupUpdate: Date.now() });
		this.refs.river.wasCorrectAnswer(answer);
	}
	incorrectAnswer(answer) {
		this.refs.river.wasIncorrectAnswer(answer);
	}
	addCorrectAnswer(answer) {
		// add a random number of wrong answers before correct answer
		this.refs.river.addCorrectAnswer(answer);
	}
	whirlpoolQuestionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'whirlpoolQuestionTimeout',
			crewNumber: this.props.crewNumber,
		}));
	}
	questionTimeout() {
		this.props.socket.send(JSON.stringify({
			event: 'questionTimeout',
			crewNumber: this.props.crewNumber,
			question: this.state.questionText,
		}));
	}
	updateHP(canoeHP) {
		this.setState({ canoeHP });
	}
	addRock(rockStartTime) {
		this.state.rock = true;
		this.showUpdate('Rock approaching', 'Answer questions faster to avoid hitting it!');
		this.refs.river.addRock(rockStartTime);
	}

	endRock() {
		this.refs.river.endRock();
		this.state.rock = false;
	}

	rockHit() {
		this.props.socket.send(JSON.stringify({ event: 'rockHit' }));
	}

	render() {
		// MARK: add flashing
		let whirlpoolValue;
		this.state.whirlpoolTimebar = <QuestionTimebar onTimeout={this.whirlpoolQuestionTimeout} timePerQuestion={5000 + this.state.whirlpoolBonus} keepRunning={this.state.whirlpool} />;
		if (this.state.whirlpool) {
			if (this.state.whirlpoolType === 'Free') {
				whirlpoolValue = (
					<div className="modal-background">
						<div className="row">
							<div className="three columns"><p></p></div>
							<div className="six columns">
								<WhirlpoolFree socket={this.props.socket} />
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
								<WhirlpoolQuestion question={this.state.whirlpoolQuestion} timebar={this.state.whirlpoolTimebar} socket={this.props.socket} />
							</div>
						</div>
					</div>
				);
			}
		}
		const timePerQuestion = this.state.rock ? 10000 : 15000;
		return (
			<div>
				<div>{this.state.update}</div>
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
					<River ref="river"
						answerData={this.props.answerData}
						answerSelected={this.answerSelected}
						answerPassedThreshold={this.answerPassedThreshold}
						canoeHP={this.state.canoeHP}
						crewSize={this.props.crewSize}
						reflectionGroupUpdate={this.state.reflectionGroupUpdate}
						updateHP={this.updateHP}
						rockHit={this.rockHit}
					/>
				</div>
			</div>
		);
	}
}

export default Game;
