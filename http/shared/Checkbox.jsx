import React, { Component, PropTypes } from 'react';

export default class Checkbox extends Component {
	render() {
		const containerStyle = {
			display: 'flex',
			width: '16%',
			height: '8%',
		};

		return (
			<div className="checkbox" style={containerStyle}>
				<input
					type="checkbox" ref={(n) => { this.node = n; }}
					onChange={this.props.onChange} required={this.props.required}
				/>
				<span>{this.props.label}</span>
			</div>
		);
	}
}

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
};
