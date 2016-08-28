import React, { Component, PropTypes } from 'react';
import colors from '../shared/colors';

export function Header() {
	const containerStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		position: 'fixed',
		zIndex: 5,
		width: '100%',
		minWidth: '200px',
		height: '10%',
		backgroundColor: colors.wasabi,
	};

	const logoStyle = {
		height: '80%',
		width: '25%',
	};

	return (
		<div className="header" style={containerStyle}>
			<img src="../img/logo-black.svg" alt="Aquaforces" style={logoStyle} />
		</div>
	);
}

export function UnderHeader({ children }) {
	const style = {
		height: '15vh',
		width: '100%',
	};

	return (
		<div style={style} />
	);
}

UnderHeader.propTypes = {
	children: PropTypes.any,
};
