import React, { Component, PropTypes } from 'react';
import Crew from './Crew.jsx';
import Leaderboard from './Leaderboard.jsx';

class GamePlayHost extends Component {
	constructor(props) {
		super(props);
		this.state = {
			gameStatus: 'hasNotStarted',
			startTime: new Date(),
			crews: this.props.initialCrews,
		};
		this.crews = {};
	}
	answerSelected(wasCorrectAnswer, crewNumber) {
		const crew = this.crews[crewNumber.toString()];
		if (wasCorrectAnswer) {
			this.updateCrewPosition(crewNumber, 0.1);
			crew.processAnswer(wasCorrectAnswer);
		}
	}
	updateCrewPosition(crewNumber, increment) {
		// MARK: move the camera around
		const oldCrews = this.state.crews;
		oldCrews[crewNumber].position += increment;
		this.setState({
			crews: oldCrews,
		});
	}
	updateCrewStatus(crewNumber, newStatus) {
		const oldCrews = this.state;
		oldCrews.crews[crewNumber].props.status = newStatus;
		this.setState(oldCrews);
	}
	updateCrewBoat(crewNumber, newBoat) {
		const oldCrews = this.state;
		oldCrews.crews[crewNumber].props.boat = newBoat;
		this.setState(oldCrews);
	}
	whirlpoolStatusChanged(status, crewNumber) {
		const crew = this.crews[crewNumber.toString()];
		crew.processWhirlpool(status);
	}
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
									Object.keys(this.state.crews).map((crewNumber, i) => {
										const crew = this.state.crews[crewNumber];
										return (<Crew
											position={crew.position} status={crew.status}
											boat={crew.boat} size={crew.users.length}
											crewNumber={crewNumber} key={i}
											ref={(c) => { this.crews[crewNumber] = c; }} />);
									})
								}
							</div>
						</div>
				</div>
			</div>
		);
	}
}

GamePlayHost.propTypes = {
	initialCrews: PropTypes.shape({
		name: PropTypes.string.isRequired,
		members: PropTypes.arrayOf(PropTypes.string).isRequired,
		position: PropTypes.number.isRequired,
		status: PropTypes.string.isRequired,
		boat: PropTypes.string.isRequired,
	}).isRequired,
};

export default GamePlayHost;
