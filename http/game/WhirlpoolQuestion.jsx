const WhirlpoolQuestion = React.createClass({
	getInitialState() {
		return {
			answers: null,
		};
	},
	componentWillMount() {
		this.preprocessAnswers();
	},
	processAnswer(answer) {
		this.props.socket.send({
			event: 'whirlpoolAnswerSelected',
			answer,
		});
	},
	preprocessAnswers() {
		let answers = [this.props.question.answer];
		this.props.question.incorrectAnswers.forEach(function (thing) {
			answers.push(thing);
		});
		answers = shuffle(answers);
		this.setState({ answers });
	},
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
						return <button className="whirlpool-button u-full-width" onClick={this.processAnswer.bind(this, answer)}>{answer}</button>;
					})
				}
			</div>
		);
	},
});

const Update = React.createClass({
	render() {
		return (
			<div className={this.props.animationText} id="notification">
				<div className="container">
					<div className="row">
						<div className="twelve columns">
							<h2 className="marginless"><b>{this.props.title}</b></h2>
							<h2>{this.props.text}</h2>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

	// popup - everything stops
	// one person gets a challenge question - multiple choice
	// timebar starts from 5 seconds
	// incorrect answer = time up
	// HP goes down by 25%
	// 10 % decrement for incorrect answers normally
	// for every 10 clicks, the timebar gets a 1 second boost
	// if correct answer for Whirlpool
	// increment by 5x correct questions