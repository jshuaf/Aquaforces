import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { TextInput } from '../../shared/Input.jsx';
import { joinGameRequest, joinGameSuccess } from './actions';

class JoinGameFormDisplay extends Component {
	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}
	onSubmit() {
		switch (this.props.boardingStatus) {
		case 'joiningGame':
			this.props.joinGameRequest();
			this.props.socket.send(JSON.stringify({
				event: 'joinGame',
				id: data.gameID,
				username: data.username,
			}));
			break;
		default:
			return;
		}
	}
	render() {
		switch (this.props.boardingStatus) {
		case 'joiningGame':
			return (
				<form id="join" onSubmit={(e) => { e.preventDefault(); onSubmit(console.log(this)); }}>
					<div className="row">
						<div className="six columns text-center">
							<img className="navbar-logo" src="/img/logo-black.svg" alt="Aquaforces" />
							<TextInput
								placeholder="123456" label="Game number"
								type="number" min="0" max="9999" required
							/>
							<TextInput placeholder="Michael Phelps" label="Username" type="text" required />
							<input
								className="button-primary u-full-width" type="submit"
								value="Submit" id="joinGameButton"
							/>
						</div>
					</div>
					<div className="row margins">
						<div className="six columns text-center">
							<h2 className="marginless">Are you a teacher?</h2>
							<a href="/host/" className="button button-primary u-full-width">Switch to host dashboard</a>
						</div>
					</div>
				</form>
			);
		case 'joiningCrew':
			return (
				<form id="crew" hidden="">
					<div className="row">
						<div className="four columns text-center">
							<TextInput type="number" min="1" max="12" label="Crew number" placeholder="4" />
							<input
								className="button-primary" type="submit"
								value="Submit" id="joinCrewButton">
								Join crew
							</input>
						</div>
					</div>
				</form>
				);
		default:
			return (
					<form id="join">
						<div className="row">
							<div className="six columns text-center">
								<img className="navbar-logo" src="/img/logo-black.svg" alt="Aquaforces" />
								<TextInput placeholder="123456" label="Game number" type="number" min="0" max="9999" />
								<TextInput placeholder="Michael Phelps" label="Username" type="text" />
								<input
									className="button-primary u-full-width" type="submit"
									value="Submit" id="joinGameButton"
								/>
							</div>
						</div>
						<div className="row margins">
							<div className="six columns text-center">
								<h2 className="marginless">Are you a teacher?</h2>
								<a href="/host/" className="button button-primary u-full-width">Switch to host dashboard</a>
							</div>
						</div>
					</form>
				);
		}
	}
}

JoinGameFormDisplay.propTypes = {
	boardingStatus: PropTypes.oneOf(['joiningGame', 'joiningCrew']),
	joinGameRequest: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	boardingStatus: state.boarding.status,
});

const mapDispatchToProps = (dispatch) => ({
	joinGameRequest: () => {
		dispatch(joinGameRequest());
	},
});

const JoinGameForm = connect(mapStateToProps, mapDispatchToProps)(JoinGameFormDisplay);

export default JoinGameForm;
