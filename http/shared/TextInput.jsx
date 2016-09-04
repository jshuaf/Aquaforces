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
		if (this.props.onChange) this.props.onChange();
	}
	error(errorMessage) {
		this.setState({ errorMessage });
	}
	clearError() {
		this.setState({ errorMessage: null });
	}
	render() {
		const containerStyle = {
			display: 'inline-table',
			width: (this.props.placeholder.length * 8) + 200 + 'px',
			maxWidth: '100%',
		};
		const labelStyle = {
			marginBottom: '2%',
			display: 'inline-table',
		};
		const inputStyle = {
			backgroundColor: this.state.errorMessage ? '#FDC5C5' : 'transparent',
			textAlign: 'left',
			color: colors.water,
			width: '100%',
			borderLeft: 'none',
			borderRight: 'none',
			borderTop: 'none',
			borderBottom: '2px solid #19a8a6',
			fontSize: '1.3em',
			display: 'inline-table',
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
				<span style={labelStyle}><b>{this.props.label}</b></span>
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
	label: PropTypes.string,
	isComplete: PropTypes.func,
	onComplete: PropTypes.func,
	onChange: PropTypes.func,
};
