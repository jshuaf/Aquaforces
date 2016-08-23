import React, { Component, PropTypes } from 'react';

class GameTimer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			time: '',
			finished: false,
			timeStart: Date.now(),
		};
		this.zeroPad = this.zeroPad.bind(this);
		this.updateTimer = this.updateTimer.bind(this);
	}
	componentDidMount() {
		setInterval(() => {
			if (!this.state.finished) {
				this.updateTimer();
			}
		}, 50);
	}
	zeroPad(t) {
		if (t < 10) return '0' + t;
		return t;
	}
	updateTimer() {
		const currentTime = Date.now();
		const ms = this.props.totalTime - currentTime + this.state.timeStart + 1000;
		let t = '';
		if (ms < 0) {
			this.props.onFinish();
			this.setState({
				finished: true,
			});
		} else if (ms < 10000) {
			t = Math.floor(ms / 60000) + ':0' + (ms / 1000).toFixed(2);
		} else {
			t = Math.floor(ms / 60000) + ':' + this.zeroPad(Math.floor(ms / 1000 % 60));
		}
		this.setState({
			time: t,
		});
	}
	render() {
		return <p hidden={this.state.finished}>Time remaining: {this.state.time}</p>;
	}
}

export default GameTimer;
