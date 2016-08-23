import React, { Component, PropTypes } from 'react';

class QuestionTimebar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now(),
		};
		this.updateTime = this.updateTime.bind(this);
		this.reset = this.reset.bind(this);
	}
	componentDidMount() {
		setInterval(() => {
			if (this.props.keepRunning) this.updateTime();
		}, 50);
	}
	updateTime() {
		if (this.props.keepRunning) {
			const currentTime = Date.now();
			const timeLeft = this.props.timePerQuestion - currentTime + this.state.timeStart;
			if (timeLeft < 0) {
				this.props.onTimeout();
			} else {
				this.setState({ timeLeft });
			}
		}
	}
	reset() {
		this.setState({
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now(),
		});
	}
	render() {
		const style = {
			width: (this.state.timeLeft / this.props.timePerQuestion * 100).toString() + '%',
			backgroundColor: '#26A65B',
			height: '100%',
		};
		return <div style={style} className="questionTime" />;
	}
}

export default QuestionTimebar;
