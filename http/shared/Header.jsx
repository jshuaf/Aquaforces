import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import colors from '../shared/colors';
import PrimaryButton from './PrimaryButton.jsx';

function Header({ currentUser }) {
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
		width: '30%',
		display: 'flex',
		alignItems: 'center',
	};

	const logoStyle = {
		height: '80%',
		width: '20%',
		minWidth: '200px',
	};

	const userInfoStyle = {
		height: '80%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textDecoration: 'none',
		fontSize: '1.3em',
		color: colors.midnight,
	};

	const logoutStyle = {
		color: colors.midnight,
		fontSize: '1em',
		textDecoration: 'none',
		':hover': { color: colors.pacific },
		marginLeft: '5px',
	};

	const headerItemStyle = Object.assign({}, userInfoStyle, {
		':hover': { color: colors.pacific } }
	);

	const linkTextStyle = {
		color: 'inherit',
	};

	return (
		<div style={containerStyle}>
			<a href="/" style={logoContainerStyle}>
				<img src="../img/logo-black.svg" alt="Aquaforces" style={logoStyle} />
			</a>
			<a href="/console" style={headerItemStyle} key={0}><span style={linkTextStyle}>Question Sets</span></a>
			<a href="/host" style={headerItemStyle} key={1}><span style={linkTextStyle}>Start a game</span></a>
			<a href="/play" style={headerItemStyle} key={2}><span style={linkTextStyle}>Join a game</span></a>
			{currentUser
			? <div style={userInfoStyle} key={3}>
					<span style={linkTextStyle}>Logged in as {currentUser.displayName}</span>
					<a href="/logout" style={logoutStyle}>(Logout)</a>
				</div>
			: <PrimaryButton>Log in</PrimaryButton>
			}
		</div>
	);
}

Header.propTypes = {
	currentUser: PropTypes.any,
};

function UnderHeader() {
	const style = {
		height: '15vh',
		width: '100%',
	};
	return <div style={style} />;
}

module.exports = { Header: new Radium(Header), UnderHeader };
