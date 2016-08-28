import React, { Component, PropTypes } from 'react';

class RiverReflection extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 80 + Math.random() * 20,
			yOffset: (2 + Math.random() * 3) * this.props.riverWidth / 100,
		};
	}
	render() {
		const style = {
			backgroundColor: this.props.backgroundColor,
			display: 'block',
			float: 'left',
			borderRadius: '10000000px',
			height: `${this.state.height}%`,
			transform: `translate3d(${this.props.xOffset}px, ${this.state.yOffset}px, 0px)`,
			width: `${this.props.width}%`,
		};
		return <div style={style} />;
	}
	// 2 - 4 groups on screen at a time
	// 2  - 3 in teach groups
	// more lighter than darker
	// make them offsetWidth
	// if 3, two should be at least the same
}

export default RiverReflection;
