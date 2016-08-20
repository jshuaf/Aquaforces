const QuestionTimebar = React.createClass({
	getInitialState() {
		return {
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now(),
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
				this.setState({ timeLeft });
			}
		}
	},

	reset() {
		this.setState({
			timeLeft: this.props.timePerQuestion,
			timeStart: Date.now(),
		});
	},

	render() {
		const style = {
			width: (this.state.timeLeft / this.props.timePerQuestion * 100).toString() + '%',
			backgroundColor: '#26A65B',
			height: '100%',
		};
		return <div style={style} className="questionTime"></div>;
	},
});

const GameTimer = React.createClass({
	propTypes: {
		onFinish: React.PropTypes.func,
	},
	getInitialState() {
		return {
			time: '',
			finished: false,
			timeStart: Date.now(),
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
	},
});

const Rock = React.createClass({
	render() {
		const rockStyle = {
			height: '100%',
		};
		let containerStyle = {
			textAlign: 'center',
			height: '12%',
			margin: '0 auto',
			transform: `translate(0px, ${this.props.y}px)`,
			display: 'table',
		};
		if (!this.props.present)
			containerStyle.display = 'none';
		return (
			<div style={containerStyle}>
				<img src="../img/obstacles/rock.svg" style={rockStyle}></img>
			</div>
		);
	},
	// rock slowly approaches
});