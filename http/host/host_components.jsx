function getValuesOfObject(object) {
	let values = [];
	for (let key in object) {
		values.push(object[key]);
	}

	return values;
}

const GameHost = React.createClass({
	// MARK: ADD END GAME
	getInitialState() {
		return {
			gameStatus: 'hasNotStarted',
			startTime: new Date(),
			crews: this.props.initialCrews
		};
	},

	answerSelected(wasCorrectAnswer, crewNumber) {
		const crew = this.refs[crewNumber.toString()];
		crew.processAnswer(wasCorrectAnswer);
	},

	updateCrewPosition(crewNumber, increment) {
		// MARK: move the camera around

		let oldCrews = this.state.crews;
		oldCrews[crewNumber].position += increment;
		this.setState({
			crews: oldCrews
		});
	},

	updateCrewStatus(crewNumber, newStatus) {
		let oldCrews = this.state;
		oldCrews.crews[crewNumber].props.status = newStatus;
		this.setState(oldCrews);
	},

	updateCrewBoat(crewNumber, newBoat) {
		let oldCrews = this.state;
		oldCrews.crews[crewNumber].props.boat = newBoat;
		this.setState(oldCrews);
	},

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="four columns">
						<div className="panel">
							<Leaderboard crews={this.state.crews} />
						</div>
					</div>
						<div className="eight columns">
							<div className="panel">
								{
									Object.keys(this.state.crews).map(function(crewNumber, i) {
										const crew = this.state.crews[crewNumber];
										return <Crew position={crew.position} status={crew.status} boat={crew.boat} crewNumber={crewNumber} key={i} ref={crewNumber.toString()}/>;
									}.bind(this))
								}
							</div>
						</div>
				</div>
			</div>
		);
	}
});

const Crew = React.createClass({
	getInitialState() {
		return {
			position: 0,
			velocity: 0,
			deltaVelocity: 10,
			maximumDeltaVelocity: 10,
			hp: 1,
			current: -0.1,
			isRaft: false
		};
	},

	getDefaultProps() {
		return {
			currentConstant: 0.003,
			velocityConstant: 0.00001,
			deltaHPConstant: -0.1
		};
	},

	processAnswer(wasCorrectAnswer) {
		if (wasCorrectAnswer) {
			this.setState({
				velocity: this.state.velocity + this.state.deltaVelocity
			});
		} else if (this.state.isRaft) {
			this.setState({deltaVelocity: this.state.deltaVelocity * 0.95});
		} else {
			this.setState({
				hp: this.state.hp + this.props.deltaHPConstant
			});
			if (!this.state.isRaft && this.state.hp <= 0) {
					this.setState({isRaft: true});
			}
		}
	},

	render() {
		const style = {
			width: '7rem',
			transform: 'translate(' + (this.state.position * 200) + ' px, 0 px)',
			backgroundColor: 'red',
			height: '3rem'
		};
		const className = this.state.isRaft ? 'raft' : '';
		return <div className={className} style={style}></div>;
	}
});

const Leaderboard = React.createClass({
	// MARK: make leaderboard sort
	render() {
		const style = {
			borderStyle: 'dotted',
			borderColor: 'green',
			borderWidth: 1.0
		};
		return (
			<div>
			<h4><strong>Leaderboard</strong></h4>
			{
				Object.keys(this.props.crews).map(function(crewNumber, i) {
					const crew = this.props.crews[crewNumber];
					return <LeaderboardEntry crewNumber={crewNumber} crewPosition={crew.position} key={i} />;
				}.bind(this))
			}
			</div>
		);
	}
});

const LeaderboardEntry = React.createClass({
	render() {
		let style = {
			fontSize: (this.props.crewPosition + 1) * 15 + 'px',
			padding: 5 + this.props.position + 'px',
			color: 'white'
		};
		return (<div className="leaderboardEntry">
		<h5>Crew {this.props.crewNumber}: <span style={style}>{Math.round(this.props.crewPosition * 10) / 10}</span></h5>
		</div>);
	}
});

export default GameHost;
