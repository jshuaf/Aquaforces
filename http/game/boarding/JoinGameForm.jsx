import React, { Component, PropTypes } from 'react';

class JoinGameForm extends Component {
	render() {
		return (
			<form id="join">
				<div className="row">
					<div className="six columns text-center">
						<img className="navbar-logo" src="/img/logo-black.svg"></img>
						<label htmlFor="game-code">Game number</label>
						<input className="u-full-width" type="number" id="game-code" autoFocus="" min="0" max="1000000" autoComplete="off" />
						<label htmlFor="crewmember-name">Username</label>
						<input className="u-full-width" type="text" id="crewmember-name" maxLength="24" autoComplete="off" />
						<input className="button-primary u-full-width" type="submit" value="Submit" id="joinGameButton"></input>
					</div>
				</div>
				<div className="row margins">
					<div className="three columns">
						<p></p>
					</div>
					<div className="six columns text-center">
						<h2 className="marginless">Are you a teacher?</h2>
						<a href="/host/" className="button button-primary u-full-width">Switch to host dashboard</a>
					</div>
				</div>
			</form>
		);
	}
}

export default JoinGameForm;
