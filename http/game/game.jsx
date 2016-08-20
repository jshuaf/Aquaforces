import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GamePlay from './play/GamePlay.jsx';
import JoinGameForm from './boarding/JoinGameForm.jsx';

function GameDisplay({ boardingInfo }) {
	switch (boardingInfo.status) {
	case 'joiningGame':
		return <JoinGameForm />;
	case 'started':
		return <GamePlay />;
	default:
		return <JoinGameForm />;
	}
}

const mapStateToProps = (state) => ({
	boardingInfo: state.boarding,
});

const Game = connect(mapStateToProps, null)(GameDisplay);

export default Game;
