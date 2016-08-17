import React, { PropTypes } from 'react';

export class TextInput extends React.Component {
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
		return (
			<div className="textInput" style={containerStyle}>
				<span style={labelStyle}>{this.props.label}</span>
				<input
					ref={(i) => { this.node = i; }} placeholder={this.props.placeholder}
					onChange={this.props.onChange}
				/>
			</div>
		);
	}
}

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
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
					onChange={this.props.onChange}
				/>
				<span>{this.props.label}</span>
			</div>
		);
	}
}

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
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
