import React, { PropTypes } from 'react';

export class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.error = this.error.bind(this);
		this.state = {
			errorMessage: null,
		};
	}
	error(errorMessage) {
		this.setState({ errorMessage });
	}
	clearError() {
		this.setState({ errorMessage: null });
	}
	render() {
		const containerStyle = {
			display: 'flex',
			flexDirection: 'column',
			height: '10%',
			width: '40%',
		};
		const labelStyle = {
			marginBottom: '2%',
			marginLeft: '1%',
		};
		const inputStyle = {
			backgroundColor: this.state.errorMessage ? '#FDC5C5' : 'white',
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
		return (
			<div className="textInput" style={containerStyle}>
				<span style={labelStyle}>{this.props.label}</span>
				<input
					ref={(i) => { this.node = i; }} placeholder={this.props.placeholder}
					onChange={this.props.onChange} style={inputStyle} required={this.props.required}
				/>
			{errorDiv}
				{}
			</div>
		);
	}
}

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
};

TextInput.defaultProps = {
	index: 0,
};

export class Checkbox extends React.Component {
	render() {
		const containerStyle = {
			display: 'flex',
			width: '16%',
			height: '8%',
		};

		return (
			<div className="checkbox" style={containerStyle}>
				<input
					type="checkbox" ref={(n) => { this.node = n; }}
					onChange={this.props.onChange} required={this.props.required}
				/>
				<span>{this.props.label}</span>
			</div>
		);
	}
}

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	required: PropTypes.bool,
};

export function ExpandButton({ onClick, children }) {
	const style = {
		textDecoration: 'underline',
	};
	return (
		<a onClick={onClick} style={style}>
			{children || '+More'}
		</a>
	);
}

ExpandButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	children: PropTypes.string,
};
