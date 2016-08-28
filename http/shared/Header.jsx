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
		height: '10%',
		backgroundColor: colors.wasabi,
	};

	const logoContainerStyle = {
		height: '100%',
		width: '40%',
		display: 'flex',
		alignItems: 'center',
	};

	const logoStyle = {
		height: '80%',
		width: '20%',
		minWidth: '200px',
	};

	const linkStyle = {
		height: '80%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textDecoration: 'none',
		fontSize: '1.4em',
	};

	const linkTextStyle = {
		color: colors.midnight,
	};

	return (
		<div style={containerStyle}>
			<div style={logoContainerStyle}>
				<img src="../img/logo-black.svg" alt="Aquaforces" style={logoStyle} />
			</div>
			<a href="/console" style={linkStyle}><span style={linkTextStyle}>Question Sets</span></a>
			<a href="/host" style={linkStyle}><span style={linkTextStyle}>Start a game</span></a>
			<a href="/play" style={linkStyle}><span style={linkTextStyle}>Join a game</span></a>
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
