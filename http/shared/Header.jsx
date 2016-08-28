import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from '../shared/colors';

function Header() {
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
		color: colors.midnight,
		':hover': {
			color: colors.pacific,
		},
	};

	const linkTextStyle = {
		color: 'inherit',
	};

	return (
		<div style={containerStyle}>
			<a href="/" style={logoContainerStyle}>
				<img src="../img/logo-black.svg" alt="Aquaforces" style={logoStyle} />
			</a>
			<a href="/console" style={linkStyle} key={0}><span style={linkTextStyle}>Question Sets</span></a>
			<a href="/host" style={linkStyle} key={1}><span style={linkTextStyle}>Start a game</span></a>
			<a href="/play" style={linkStyle} key={2}><span style={linkTextStyle}>Join a game</span></a>
		</div>
	);
}

function UnderHeader() {
	const style = {
		height: '15vh',
		width: '100%',
	};
	return <div style={style} />;
}

module.exports = { Header: new Radium(Header), UnderHeader };
