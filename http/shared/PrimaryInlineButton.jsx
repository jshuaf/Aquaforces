import React, { Component, PropTypes } from 'react';
import colors from './colors';

/* eslint-disable react/prefer-stateless-function */
class PrimaryInlineButton extends Component {
	render() {
		const { children, ...buttonProps } = this.props;
		return <button className="button button-primary button-inline" {...buttonProps}>{children}</button>;
	}
}
/* eslint-enable react/prefer-stateless-function */

PrimaryInlineButton.propTypes = {
	children: PropTypes.any,
};

export default PrimaryInlineButton;
