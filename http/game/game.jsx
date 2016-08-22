import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GamePlay from './play/GamePlay.jsx';
import JoinGameForm from './boarding/JoinGameForm.jsx';

class GameDisplay extends Component {
	render() {
		switch (this.props.boardingStatus) {
		case 'joiningGame':
		case 'joiningCrew':
			return <JoinGameForm socket={this.props.socket} />;
		case 'joined':
			return <p>You joined the game.</p>;
		case 'started':
			return <GamePlay socket={this.props.socket} ref={(g) => { this.gamePlay = g; }} />;
		default:
			return;
		}
	}
}

GameDisplay.propTypes = {
	boardingStatus: PropTypes.oneOf(['joiningGame', 'joiningCrew', 'joined', 'started']).isRequired,
	socket: PropTypes.instanceOf(WebSocket).isRequired,
};

const mapStateToProps = (state) => ({
	boardingStatus: state.boarding.status,
});

const Game = connect(mapStateToProps, null)(GameDisplay);

export default Game;
