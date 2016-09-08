import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryButton extends Component {
	render() {
		let currentStyle = {
			borderRadius: '99999px',
			backgroundColor: colors.coral,
			border: 'none',
			fontSize: '1.3em',
			color: 'white',
			':hover': { backgroundColor: colors.rosebud },
			height: '40px',
			minWidth: '150px',
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
