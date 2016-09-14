import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GamePlay from './play/GamePlay.jsx';
import JoinGameForm from './boarding/JoinGameForm.jsx';
import { Header, UnderHeader } from '../shared/Header.jsx';

class GameDisplay extends Component {
	constructor(props) {
		super(props);
		this.gamePlay = null;
	}
	render() {
		switch (this.props.boardingStatus) {
		case 'joiningGame':
		case 'joiningCrew':
			return (
				<div>
					<Header />
				<UnderHeader />/aq
					<div className="container">
						<div className="row">
							<JoinGameForm socket={this.props.socket} />
						</div>
					</div>
			</div>
			);
		case 'joined':
			return (
				<div>
					<Header />
					<UnderHeader />
					<div className="container">
						<div className="row">
							<p>You joined the game.</p>
						</div>
					</div>
				</div>
			);
		case 'started':
			return <GamePlay socket={this.props.socket} ref={this.props.instance} />;
		default:
			return;
		}
	}
}

GameDisplay.propTypes = {
	boardingStatus: PropTypes.oneOf(['joiningGame', 'joiningCrew', 'joined', 'started']).isRequired,
	socket: PropTypes.instanceOf(WebSocket).isRequired,
	instance: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	boardingStatus: state.boarding.status,
});

const Game = connect(mapStateToProps, null)(GameDisplay);

export default Game;
