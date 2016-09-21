import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryButton extends Component {
	render() {
		let currentStyle = {
			borderRadius: '30px',
			backgroundColor: '#ed676c',
			border: 'none',
			letterSpacing: 'normal',
			textTransform: 'none',
			fontSize: '1.5rem',
			fontWeight: 'bold',
			color: 'white',
		};

		const { children, style, ...buttonProps } = this.props;
		if (style) currentStyle = Object.assign({}, currentStyle, style);
		return <button style={currentStyle} {...buttonProps}>{children}</button>;
	}
}

PrimaryButton.propTypes = {
	children: PropTypes.any,
	style: PropTypes.object,
};

const PrimaryButtonRadium = new Radium(PrimaryButton);

export default PrimaryButtonRadium;
