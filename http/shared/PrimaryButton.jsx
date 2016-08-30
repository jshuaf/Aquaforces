import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryButton extends Component {
	render() {
		const style = {
			borderRadius: '99999px',
			backgroundColor: colors.coral,
			border: 'none',
			fontSize: '1.3em',
			color: 'white',
			':hover': { backgroundColor: colors.rosebud },
			height: '40px',
			minWidth: '150px',
		};

		const { children, ...buttonProps } = this.props;
		return <button style={style} {...buttonProps}>{children}</button>;
	}
}

PrimaryButton.propTypes = {
	children: PropTypes.any,
};

const PrimaryButtonRadium = new Radium(PrimaryButton);

export default PrimaryButtonRadium;
