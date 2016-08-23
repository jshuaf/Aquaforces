import React, { Component, PropTypes } from 'react';

export default function ExpandButton({ onClick, children }) {
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
