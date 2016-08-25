import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetPicker from './QuestionSetPicker.jsx';
import GamePlayHost from './GamePlayHost.jsx';
import Spinner from '../shared/Spinner.jsx';
import { questionSetPropTypes } from '../console/QuestionSet.jsx';
import { newGame, startGameRequest } from './actions';

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
		this.props.startGameRequest();
		this.props.socket.send(JSON.stringify({
			event: 'startGame',
		}));
	}
	render() {
		if (this.props.gameInfo.pending) {
			return <Spinner />;
		}
		switch (this.props.gameInfo.status) {
		case 'notStarted':
			return (
				<div id="gameHost">
					<QuestionSetPicker />
					<button className="button button-primary" onClick={this.newGame}>New game</button>
				</div>
			);
		case 'boarding':
			return (
				<div id="gameHost">
					<h1>Your game ID is: {this.props.gameInfo.gameID}</h1>
					<h4>Users without crews:</h4>
					{this.props.usersWithoutCrews.map((user, index) => <p key={index}>{user}</p>)}
					<h4>Crews:</h4>
					{Object.keys(this.props.crews).map((key) =>
						this.props.crews[key].map((user, index) =>
							<p key={index}>User {user} is in crew {key}</p>
						)
					)}
					<button className="button button-primary" onClick={this.startGame}>Start game</button>
				</div>
			);
		case 'inProgress':
			return <GamePlayHost ref={this.props.instance} />;
		default:
			return <p>Error</p>;
		}
	}
}

GameHostDisplay.propTypes = {
	newGame: PropTypes.func.isRequired,
	startGameRequest: PropTypes.func.isRequired,
	gameInfo: PropTypes.shape({
		status: PropTypes.oneOf(['notStarted', 'boarding', 'inProgress', 'ended']),
		pending: PropTypes.bool.isRequired,
		gameID: PropTypes.number,
	}).isRequired,
	socket: PropTypes.instanceOf(WebSocket).isRequired,
	selectedSet: PropTypes.shape(questionSetPropTypes),
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
	startGameRequest: () => {
		dispatch(startGameRequest());
	},
});

const GameHost = connect(mapStateToProps, mapDispatchToProps)(GameHostDisplay);

export default GameHost;
