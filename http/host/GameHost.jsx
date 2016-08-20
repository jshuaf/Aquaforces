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
		this.props.socket.send(JSON.stringify({
			event: 'newGame',
			set: this.props.selectedSet,
		}));
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
	selectedSet: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		nextQuestionID: PropTypes.number.isRequired,
		questions: PropTypes.arrayOf(PropTypes.shape({
			text: PropTypes.string.isRequired,
			correctAnswer: PropTypes.string.isRequired,
			incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
				text: PropTypes.string.isRequired,
				id: PropTypes.number.isRequired,
			})).isRequired,
			id: PropTypes.number.isRequired,
		})).isRequired,
		privacy: PropTypes.bool.isRequired,
	}),
};

const mapStateToProps = (state) => ({
	gameStatus: state.gameStatus,
	selectedSet: state.boarding.selectedSet,
});

const mapDispatchToProps = (dispatch) => ({
	newGame: () => {
		dispatch(newGame());
	},
});

const GameHost = connect(mapStateToProps, mapDispatchToProps)(GameHostDisplay);

export default GameHost;
