import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';

class Canoe extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: null,
			topPosition: null,
		};
		autoBind(this);
	}
	componentDidMount() {
		this.calculateDimensions();
	}
	getBounds() {
		return this.canoe.getBoundingClientRect();
	}
	calculateDimensions() {
		this.setState({
			height: this.canoe.offsetHeight,
			width: this.canoe.offsetWidth,
			parentWidth: this.canoe.parentElement.clientWidth,
			topPosition: this.canoe.getBoundingClientRect().top,
		});
	}
	render() {
		// shake 0.82s cubic-bezier(.36,.07,.19,.97) both
		const hp = this.props.hp;
		let image = '../img/boats-top';

		if (hp > 50) {
			image += '/canoe-100';
		} else if (hp > 25) {
			image += '/canoe-50';
		} else if (hp > 10) {
			image += '/canoe-25';
		} else if (hp > 0) {
			image += '/canoe-10';
		} else if (hp <= 0) {
			image += '/rafts';
		}

		image += `/${this.props.crewSize}-members.svg`;

		const canoeStyle = {
			height: '100%',
		};
		const containerStyle = {
			textAlign: 'center',
			height: '50%',
			margin: '0 auto',
			transform: `translate(0px, ${window.innerHeight / 3.5}px)`,
			display: 'table',
		};

		return (
			<div style={containerStyle}>
				<img id="canoe" src={image} style={canoeStyle} ref={(c) => { this.canoe = c; }} alt="" />
			</div>
		);
	}
}

export default Canoe;
