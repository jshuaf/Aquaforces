import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { TextInput } from '../../shared/Input.jsx';
import { joinGameRequest, joinCrewRequest } from './actions';

class JoinGameFormDisplay extends Component {
	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}
	onSubmit() {
		const formData = {};
		this.form.elements.forEach((element, index) => {
			if (index !== this.form.elements.length - 1) formData[element.name] = element.value;
		});
		switch (this.props.boardingStatus) {
		case 'joiningGame':
			this.props.joinGameRequest();
			this.props.socket.send(JSON.stringify(Object.assign(formData, {
				event: 'joinGame',
			})));
			break;
		case 'joiningCrew':
			this.props.joinCrewRequest();
			this.props.socket.send(JSON.stringify(Object.assign(formData, {
				event: 'joinCrew',
			})));
			break;
		default:
			return;
		}
	}
	render() {
		switch (this.props.boardingStatus) {
		case 'joiningGame':
		default:
			return (
				<form
					onSubmit={(e) => { e.preventDefault(); this.onSubmit(); }}
					ref={(f) => { this.form = f; }}
				>
					<div className="row">
						<div className="six columns text-center">
							<img className="navbar-logo" src="/img/logo-black.svg" alt="Aquaforces" />
							<TextInput
								placeholder="1234" label="Game number" name="gameID"
								type="number" min="0" max="9999" required autoComplete="off"
							/>
							<TextInput
								placeholder="Michael Phelps" name="username"
								label="Username" type="text" required autoComplete="off"
							/>
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
				<form
					onSubmit={(e) => { e.preventDefault(); this.onSubmit(); }}
					ref={(f) => { this.form = f; }}
				>
					<div className="row">
						<div className="four columns text-center">
							<TextInput
								type="number" min="1" max="12" autoComplete="off"
								label="Crew number" placeholder="4" name="crewNumber"
							/>
							<input
								className="button-primary" type="submit"
								value="Submit" id="joinCrewButton" />
						</div>
					</div>
				</form>
				);
		}
	}
}

JoinGameFormDisplay.propTypes = {
	boardingStatus: PropTypes.oneOf(['joiningGame', 'joiningCrew', 'joined']),
	joinGameRequest: PropTypes.func.isRequired,
	joinCrewRequest: PropTypes.func.isRequired,
	socket: PropTypes.instanceOf(WebSocket).isRequired,
};

const mapStateToProps = (state) => ({
	boardingStatus: state.boarding.status,
});

const mapDispatchToProps = (dispatch) => ({
	joinGameRequest: () => {
		dispatch(joinGameRequest());
	},
	joinCrewRequest: () => {
		dispatch(joinCrewRequest());
	},
});

const JoinGameForm = connect(mapStateToProps, mapDispatchToProps)(JoinGameFormDisplay);

export default JoinGameForm;
