import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GamePlay from './play/GamePlay.jsx';
import JoinGameForm from './boarding/JoinGameForm.jsx';
import { joinGame } from './boarding/actions';

class GameDisplay extends Component {
	constructor(props) {
		super(props);
		this.handleJoin = this.handleJoin.bind(this);
	}
	handleJoin(data) {
		switch (this.props.boardingInfo.status) {
		case 'joiningGame':
			return this.props.joinGame(data.gameID, data.username);
		default:
			return;
		}
	}
	render() {
		switch (this.props.boardingInfo.status) {
		case 'joiningGame' || 'joiningCrew':
			return <JoinGameForm boardingStatus={this.props.boardingInfo.status} onSubmit={this.handleJoin} />;
		case 'started':
			return <GamePlay />;
		default:
			return <JoinGameForm />;
		}
	}
}

GameDisplay.propTypes = {
	joinGame: PropTypes.func.isRequired,
	boardingInfo: PropTypes.shape({
		status: PropTypes.oneOf(['joiningGame', 'joiningCrew', 'joined', 'started']).isRequired,
		id: PropTypes.number,
		username: PropTypes.string,
	}).isRequired,
	socket: PropTypes.instanceOf(WebSocket).isRequired,
};

const mapStateToProps = (state) => ({
	boardingInfo: state.boarding,
});

const mapDispatchToProps = (dispatch) => ({
	joinGame: (gameID, username) => {
		dispatch(joinGame(gameID, username));
	},
});

const Game = connect(mapStateToProps, mapDispatchToProps)(GameDisplay);

export default Game;
