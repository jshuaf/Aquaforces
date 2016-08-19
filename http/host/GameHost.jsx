import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetPicker from './QuestionSetPicker.jsx';
import { startGame } from './actions';

class GameHostDisplay extends Component {
	constructor(props) {
		super(props);
		this.startGame = this.startGame.bind(this);
	}
	startGame() {
		this.props.startGame();
	}
	render() {
		return (
			<div id="gameHost">
				<QuestionSetPicker />
				<button onClick={this.startGame}>Start game</button>
			</div>
		);
	}
}

GameHostDisplay.propTypes = {
	startGame: PropTypes.func.isRequired,
	gameStatus: PropTypes.oneOf(['notStarted', 'boarding', 'inProgress', 'ended']),
	socket: PropTypes.instanceOf(WebSocket).isRequired,
};

const mapStateToProps = (state) => ({
	gameStatus: state.gameStatus,
});

const mapDispatchToProps = (dispatch) => ({
	startGame: () => {
		dispatch(startGame());
	},
});

const GameHost = connect(mapStateToProps, mapDispatchToProps)(GameHostDisplay);

export default GameHost;
