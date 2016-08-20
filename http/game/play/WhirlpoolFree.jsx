import React, { Component, PropTypes } from 'react';

class WhirlpoolFree extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tapStreak: 0,
		};
	}
	processTap() {
		this.setState({ tapStreak: this.state.tapStreak + 1 });
		if (this.state.tapStreak === 5) {
			console.log('YOU GO!');
			this.props.socket.send(JSON.stringify({
				event: 'whirlpoolFiveTapsDetected',
			}));
			this.setState({ tapStreak: 0 });
		}
	}
	render() {
		return (
			<div className="modal modal-active panel-group">
				<div className="row">
					<div className="twelve columns panel">
						<h1><strong>Tap!</strong></h1>
						<p>For every tap, you give your friend a bit more time to answer the challenge question.</p>
						<button className="tap-button" onClick={this.processTap}>GO</button>
					</div>
				</div>
			</div>
		);
	}
}

export default WhirlpoolFree;
