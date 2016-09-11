import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetPicker from './QuestionSetPicker.jsx';
import GamePlayHost from './GamePlayHost.jsx';
import GameBoarding from './GameBoarding.jsx';
import Spinner from '../shared/Spinner.jsx';
import { questionSetPropTypes } from '../console/QuestionSet.jsx';
import { newGame, startGameRequest } from './actions';
import { Header, UnderHeader } from '../shared/Header.jsx';

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
					<Header />
					<UnderHeader />
					<div className="container">
						<div className="row">
							<QuestionSetPicker />
							<button className="button button-primary" onClick={this.newGame}>New game</button>
						</div>
					</div>
				</div>
			);
		case 'boarding':
			return <GameBoarding startGame={this.startGame} />;
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
