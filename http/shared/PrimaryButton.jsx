import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryButtonRaw extends Component {
	render() {
		const style = {
			borderRadius: '99999px',
			backgroundColor: colors.coral,
			border: 'none',
			fontSize: '1.5em',
			color: 'white',
			fontWeight: 'bold',
		};

		const { children, ...buttonProps } = this.props;
		return <button style={style} {...buttonProps}>{children}</button>;
	}
}

PrimaryButtonRaw.propTypes = {
	children: PropTypes.any,
};

const PrimaryButton = new Radium(PrimaryButtonRaw);

export default PrimaryButton;
