import React, { Component, PropTypes } from 'react';

/* global shuffle:true */

class WhirlpoolQuestion extends Component {
	constructor(props) {
		super(props);
		this.state = {
			answers: null,
		};
		this.processAnswer = this.processAnswer.bind(this);
		this.preprocessAnswers = this.preprocessAnswers.bind(this);
	}
	componentWillMount() {
		this.preprocessAnswers();
	}
	processAnswer(answer) {
		this.props.socket.send({
			event: 'whirlpoolAnswerSelected',
			answer,
		});
	}
	preprocessAnswers() {
		let answers = [this.props.question.answer];
		this.props.question.incorrectAnswers.forEach((thing) => {
			answers.push(thing);
		});
		answers = shuffle(answers);
		this.setState({ answers });
	}
	render() {
		const answers = this.state.answers;
		return (
			<div className="modal-active whirlpool panel-group">
				<div className="panel-top">
					<h1><strong>Challenge</strong></h1>
					<h4 className="whirlpool-question">{this.props.question.text}</h4>
				</div>
				{this.props.timebar}
				{
					answers.map(function (answer) {
						return (<button
							className="whirlpool-button u-full-width">
							{answer}
						</button>);
					})
				}
			</div>
		);
	}
}

export default WhirlpoolQuestion;
	// removed onClick = {this.processAnswer bind(this, answer)} from button
	// popup - everything stops
	// one person gets a challenge question - multiple choice
	// timebar starts from 5 seconds
	// incorrect answer = time up
	// HP goes down by 25%
	// 10 % decrement for incorrect answers normally
	// for every 10 clicks, the timebar gets a 1 second boost
	// if correct answer for Whirlpool
	// increment by 5x correct questions
