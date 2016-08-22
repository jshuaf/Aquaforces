import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetPicker from './QuestionSetPicker.jsx';
import { newGame } from './actions';

class GameHostDisplay extends Component {
	constructor(props) {
		super(props);
		this.newGame = this.newGame.bind(this);
		this.startGame = this.startGame.bind(this);
	}
	newGame() {
		this.props.newGame();
		this.props.socket.send(JSON.stringify({
			event: 'newGame',
			set: this.props.selectedSet,
		}));
	}
	startGame() {
		// MARK: start game
	}
	render() {
		switch (this.props.gameInfo.status) {
		case 'notStarted':
			return (
				<div id="gameHost">
					<QuestionSetPicker />
					<button onClick={this.newGame}>New game</button>
				</div>
			);
		case 'boarding':
			return (
				<div id="gameHost">
					<h2>{this.props.gameInfo.gameID}</h2>
					<h4>Users without crews:</h4>
					{this.props.usersWithoutCrews.map((user, index) => <p key={index}>{user}</p>)}
					<h4>Crews:</h4>
					{Object.keys(this.props.crews).map((key) =>
						this.props.crews[key].map((user, index) =>
							<p key={index}>User {user} is in crew {key}</p>
						)
					)}
					<button onClick={this.startGame}>Start game</button>
				</div>
			);
		default:
			return <p>Error</p>;
		}
	}
}

GameHostDisplay.propTypes = {
	newGame: PropTypes.func.isRequired,
	gameInfo: PropTypes.shape({
		status: PropTypes.oneOf(['notStarted', 'boarding', 'inProgress', 'ended']),
		gameID: PropTypes.number,
	}).isRequired,
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
	usersWithoutCrews: PropTypes.arrayOf(PropTypes.string).isRequired,
	crews: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

const mapStateToProps = (state) => ({
	gameInfo: state.gameInfo,
	selectedSet: state.boarding.selectedSet,
	usersWithoutCrews: state.boarding.usersWithoutCrews,
	crews: state.boarding.crews,
});

const mapDispatchToProps = (dispatch) => ({
	newGame: () => {
		dispatch(newGame());
	},
});

const GameHost = connect(mapStateToProps, mapDispatchToProps)(GameHostDisplay);

export default GameHost;
