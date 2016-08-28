import React, { Component, PropTypes } from 'react';

export default function Header() {
	const containerStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		position: 'fixed',
		zIndex: 5,
		width: '100%',
		height: '15%',
		backgroundColor: '#86CF8C',
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
