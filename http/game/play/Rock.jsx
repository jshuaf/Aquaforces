import React, { Component, PropTypes } from 'react';

class Rock extends Component {
	render() {
		const rockStyle = {
			height: '100%',
		};
		let containerStyle = {
			textAlign: 'center',
			height: '12%',
			margin: '0 auto',
			transform: `translate(0px, ${this.props.y}px)`,
			display: 'table',
		};
		if (!this.props.present) containerStyle.display = 'none';
		return (
			<div style={containerStyle}>
				<img src="../img/obstacles/rock.svg" style={rockStyle} alt="" />
			</div>
		);
	}
}

export default Rock;
