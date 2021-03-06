import React, { Component, PropTypes } from 'react';
import RiverReflection from './RiverReflection.jsx';

class RiverReflectionGroup extends Component {
	constructor(props) {
		super(props);
		const lighterColor = '#C1E4EB';
		const darkerColor = '#0068A0';
		this.state = {
			numberOfReflections: Math.floor(2 + 2 * Math.random()),
			backgroundColor: Math.random() < 0.5 ? lighterColor : darkerColor,
			height: 25 + Math.random() * 10,
		};
	}
	render() {
		const riverReflections = [];
		for (let i = 0; i < this.state.numberOfReflections; i++) {
			riverReflections.push(<RiverReflection
				backgroundColor={this.state.backgroundColor}
				riverWidth={this.props.riverWidth}
				height={this.state.height}
				width={100 / this.state.numberOfReflections}
				xOffset={-i}
				key={i}
			/>);
		}

		const style = {
			transform: `translate3d(${this.props.x}px, ${this.props.y}px, 0px)`,
			height: `${this.state.height}%`,
			width: `${this.state.numberOfReflections * 4}%`,
			maxWidth: `${this.state.numberOfReflections * 20}px`,
			zIndex: '-10',
			position: 'absolute',
		};
		return (
			<div style={style}>
				{riverReflections}
			</div>
		);
	}
}

export default RiverReflectionGroup;
