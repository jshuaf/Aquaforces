import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';

class Crew extends Component {
	constructor(props) {
		super(props);
		this.state = {
			velocity: 0,
			deltaVelocity: 10,
			maximumDeltaVelocity: 10,
			hp: 1,
			current: -0.1,
			isRaft: false,
			isWhirlpool: false,
		};
		autoBind(this);
	}
	processWhirlpool(status) {
		switch (status) {
		case 'new':
			this.setState({ isWhirlpool: true });
			break;
		case 'timeout':
			this.setState({ hp: this.state.hp - 0.25, isWhirlpool: false });
			break;
		case 'wrongAnswer':
			this.setState({ hp: this.state.hp - 0.25, isWhirlpool: false });
			break;
		case 'correctAnswer':
			this.setState({ position: this.state.position + 0.3, isWhirlpool: false });
			break;
		default:
			break;
		}
	}
	processAnswer(wasCorrectAnswer) {
		if (wasCorrectAnswer) {
			this.setState({
				velocity: this.state.velocity + this.state.deltaVelocity,
			});
		} else if (this.state.isRaft) {
			this.setState({ deltaVelocity: this.state.deltaVelocity * 0.25 });
		} else {
			this.setState({
				hp: this.state.hp + this.props.deltaHPConstant,
			});
			if (!this.state.isRaft && this.state.hp <= 0) {
				this.setState({ isRaft: true });
			}
		}
	}
	render() {
		const style = {
			width: '10rem',
			marginLeft: `${this.props.position * 100}px`,
			borderRadius: '5px',
			border: 'none',
			background: `url(/img/boats-side/
				${this.state.isRaft ? 'rafts' : 'canoes'}
				/${this.props.size}-members.svg no-repeat center top,`,
		};
		const className = this.state.isRaft ? 'raft' : 'racetrack-boat';
		return <div className={className} style={style}><p>Crew {this.props.crewNumber}</p></div>;
	}
}

Crew.defaultProps = {
	currentConstant: 0.003,
	velocityConstant: 0.00001,
	deltaHPConstant: -0.1,
};

Crew.propTypes = {
	deltaHPConstant: PropTypes.number.isRequired,
	position: PropTypes.number.isRequired,
	size: PropTypes.number.isRequired,
	crewNumber: PropTypes.number.isRequired,
};

export default Crew;
