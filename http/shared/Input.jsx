import React, { PropTypes } from 'react';

export function TextInput({ placeholder, label }) {
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
			<span style={labelStyle}>{label}</span>
			<input placeholder={placeholder} />
		</div>
	);
}

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
};

export function Checkbox({ label }) {
	const containerStyle = {
		display: 'flex',
		width: '16%',
		height: '8%',
	};

	return (
		<div className="checkbox" style={containerStyle}>
			<input type="checkbox" />
			<span>{label}</span>
		</div>
	);
}

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
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
