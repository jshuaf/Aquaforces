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
		if (wasCorrectAnswer)
			this.updateCrewPosition(crewNumber, 0.1);
		crew.processAnswer(wasCorrectAnswer);
	},

	updateCrewPosition(crewNumber, increment) {
		// MARK: move the camera around
		console.log("Move " + crewNumber + " by " + increment);
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

	whirlpoolStatusChanged(status, crewNumber) {
		const crew = this.refs[crewNumber.toString()];
		crew.processWhirlpool(status);
	},

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="three columns">
						<div className="panel">
							<Leaderboard crews={this.state.crews} />
						</div>
					</div>
						<div className="nine columns">
							<div className="panel">
								<h4><strong>Live stream</strong></h4>
								{
									Object.keys(this.state.crews).map(function(crewNumber, i) {
										const crew = this.state.crews[crewNumber];
										return <Crew position={crew.position} status={crew.status} boat={crew.boat} size={crew.users.length} crewNumber={crewNumber} key={i} ref={crewNumber.toString()}/>;
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
			velocity: 0,
			deltaVelocity: 10,
			maximumDeltaVelocity: 10,
			hp: 1,
			current: -0.1,
			isRaft: false,
			isWhirlpool: false
		};
	},

	getDefaultProps() {
		return {
			currentConstant: 0.003,
			velocityConstant: 0.00001,
			deltaHPConstant: -0.1
		};
	},

	processWhirlpool(status) {
		switch (status) {
			case 'new':
				this.setState({isWhirlpool: true});
				break;
			case 'timeout':
				this.setState({hp: this.state.hp - 0.25, isWhirlpool: false});
				break;
			case 'wrongAnswer':
				this.setState({hp: this.state.hp - 0.25, isWhirlpool: false});
				break;
			case 'correctAnswer':
				this.setState({position: this.state.position + 0.3, isWhirlpool: false});
				break;
			default:
				break;
			}
	},

	processAnswer(wasCorrectAnswer) {
		if (wasCorrectAnswer) {
			this.setState({
				velocity: this.state.velocity + this.state.deltaVelocity
			});
		} else if (this.state.isRaft) {
			this.setState({deltaVelocity: this.state.deltaVelocity * 0.25});
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
		let style = {
			width: '10rem',
			marginLeft: (this.props.position * 100) + 'px',
			borderRadius: '5px',
			border: 'none',
			background: 'url(/img/boats-side/' + (this.state.isRaft ? 'rafts' : 'canoes') + '/' + this.props.size + '-members.svg) no-repeat center top'
		};
		const className = this.state.isRaft ? 'raft' : 'racetrack-boat';
		console.log(this.props.position);
		return <div className={className} style={style}><p>Crew {this.props.crewNumber}</p></div>;
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
			padding: 5 + this.props.crewPosition + 'px'
		};
		return (<div className="leaderboardEntry">
		<h5>Crew {this.props.crewNumber}: <span style={style}>{Math.round(this.props.crewPosition * 10) / 10} className = "pill"</span></h5>
		</div>);
	}
});
