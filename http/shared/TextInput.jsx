import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import colors from './colors';

export default class TextInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errorMessage: null,
		};
		autoBind(this);
	}
	onChange() {
		if (this.props.isComplete && this.props.onComplete) {
			const text = this.node.value;
			if (this.props.isComplete(text)) this.props.onComplete();
		}
		this.props.onChange();
	}
	error(errorMessage) {
		this.setState({ errorMessage });
	}
	clearError() {
		this.setState({ errorMessage: null });
	}
	render() {
		const containerStyle = {
			display: 'block',
			width: '100%',
		};
		const labelStyle = {
			marginBottom: '2%',
			marginLeft: '1%',
		};
		const inputStyle = {
			backgroundColor: this.state.errorMessage ? '#FDC5C5' : 'white',
			color: colors.midnight,
			width: '100%',
		};
		const errorContainerStyle = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'left',
			width: '100%',
			marginLeft: '1%',
			marginTop: '2%',
		};
		const errorIconStyle = {
			height: '1.2rem',
			width: '1.2rem',
			marginRight: '0.5rem',
		};
		const errorMessageStyle = {
			color: '#D25244',
			fontSize: '0.85rem',
		};

		const errorDiv = this.state.errorMessage ?
			<div style={errorContainerStyle}>
				<img src="../img/icons/exclamation.svg" alt="" style={errorIconStyle} />
				<span style={errorMessageStyle}>{this.state.errorMessage}</span>
			</div> : undefined;

		/* eslint-disable no-unused-vars */
		const { onComplete, isComplete, ...inputProps } = this.props;
		/* eslint-enable no-unused-vars */

		return (
			<div className="textInput" style={containerStyle}>
				<span style={labelStyle}>{this.props.label}</span>
				<input
					ref={(i) => { this.node = i; }} style={inputStyle} {...inputProps}
					onChange={this.onChange}
				/>
			{errorDiv}
			</div>
		);
	}
}

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
	isComplete: PropTypes.func,
	onComplete: PropTypes.func,
	onChange: PropTypes.func,
};
