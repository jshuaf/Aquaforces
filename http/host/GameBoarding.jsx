import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { Header } from '../shared/Header.jsx';

class GameBoardingDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	render() {
		return (
			<div id="gameHost">
				<Header />
				<h1>Your game ID is: {this.props.gameID}</h1>
				<h4>Users without crews:</h4>
				{this.props.usersWithoutCrews.map((user, index) => <p key={index}>{user}</p>)}
				<h4>Crews:</h4>
				{Object.keys(this.props.crews).map((key) =>
					this.props.crews[key].map((user, index) =>
						<p key={index}>User {user} is in crew {key}</p>
					)
				)}
				<button className="button button-primary" onClick={this.props.startGame}>Start game</button>
			</div>
		);
	}
}

GameBoardingDisplay.propTypes = {
	usersWithoutCrews: PropTypes.arrayOf(PropTypes.string).isRequired,
	crews: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
	gameID: PropTypes.number,
	startGame: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	gameID: state.gameInfo.gameID,
	usersWithoutCrews: state.boarding.usersWithoutCrews,
	crews: state.boarding.crews,
});

const GameBoarding = connect(mapStateToProps)(GameBoardingDisplay);

export default GameBoarding;
