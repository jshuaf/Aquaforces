import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetPicker from './QuestionSetPicker.jsx';
import { newGame } from './actions';

class GameHostDisplay extends Component {
	constructor(props) {
		super(props);
		this.newGame = this.newGame.bind(this);
	}
	newGame() {
		this.props.newGame();
		this.props.socket.sendJSON({
			event: 'newGame',
		});
	}
	render() {
		return (
			<div id="gameHost">
				<QuestionSetPicker />
				<button onClick={this.newGame}>Start game</button>
			</div>
		);
	}
}

GameHostDisplay.propTypes = {
	newGame: PropTypes.func.isRequired,
	gameStatus: PropTypes.oneOf(['notStarted', 'boarding', 'inProgress', 'ended']),
	socket: PropTypes.instanceOf(WebSocket).isRequired,
};

const mapStateToProps = (state) => ({
	gameStatus: state.gameStatus,
});

const mapDispatchToProps = (dispatch) => ({
	newGame: () => {
		dispatch(newGame());
	},
});

const GameHost = connect(mapStateToProps, mapDispatchToProps)(GameHostDisplay);

export default GameHost;
