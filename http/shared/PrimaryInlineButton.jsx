import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryInlineButton extends Component {
	render() {
		const { children, ...buttonProps } = this.props;
		return <button className="button button-primary button-inline" {...buttonProps}>{children}</button>;
	}
}

PrimaryInlineButton.propTypes = {
	children: PropTypes.any,
};

const PrimaryInlineButtonRadium = new Radium(PrimaryInlineButton);

export default PrimaryInlineButton;
