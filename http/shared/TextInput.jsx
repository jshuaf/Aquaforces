import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import Radium from 'radium';
import colors from './colors';

class TextInputDisplay extends Component {
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
			width: this.props.width || '100%',
			maxWidth: this.props.maxWidth || '500px',
		};
		const labelStyle = {
			marginBottom: '2%',
			display: 'inline-table',
		};
		let inputStyle = {
			backgroundColor: this.state.errorMessage ? '#FDC5C5' : 'transparent',
			textAlign: 'left',
			color: colors.water,
			width: '100%',
			borderStyle: 'solid',
			borderColor: colors.midnight,
			borderWidth: '0.1px',
			borderRadius: '9999999px',
			fontSize: '1.3em',
			textIndent: '4%',
			padding: '7px 0px 7px 0px',
			backgroundSize: '3%',
			outlineWidth: '0',
			':focus': {
				borderColor: colors.pacific,
			},
		};

		if (this.props.icon) {
			inputStyle = Object.assign({}, inputStyle, {
				textIndent: '8%',
				padding: '7px 0px 7px 0px',
				backgroundImage: "url('/img/icons/search.svg')",
				backgroundRepeat: 'no-repeat',
				backgroundPosition: '2%',
				backgroundAttachment: 'scroll',
				backgroundSize: '3%',
			});
		}
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
		const { onComplete, isComplete, width, maxWidth, icon, ...inputProps } = this.props;
		/* eslint-enable no-unused-vars */

		return (
			<div className="textInput" style={containerStyle}>
				{this.props.label ? <span style={labelStyle}><b>{this.props.label}</b></span> : null}
				<input
					ref={(i) => { this.node = i; }} style={inputStyle} {...inputProps}
					onChange={this.onChange}
				/>
			{errorDiv}
			</div>
		);
	}
}

TextInputDisplay.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string,
	isComplete: PropTypes.func,
	onComplete: PropTypes.func,
	onChange: PropTypes.func,
	width: PropTypes.string,
	maxWidth: PropTypes.string,
	icon: PropTypes.string,
};

const TextInput = new Radium(TextInputDisplay);
export default TextInput;
