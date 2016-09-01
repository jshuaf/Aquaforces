import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryButton extends Component {
	render() {
		const { children, ...buttonProps } = this.props;
		return <button className="button button-primary" {...buttonProps}>{children}</button>;
	}
}

PrimaryButton.propTypes = {
	children: PropTypes.any,
};

const PrimaryButtonRadium = new Radium(PrimaryButton);

export default PrimaryButtonRadium;
