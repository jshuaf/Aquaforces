import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import Radium from 'radium';
import colors from '../shared/colors';
import PrimaryButton from './PrimaryButton.jsx';

const request = require('request');
/* global sweetAlert:true */

export class HeaderRaw extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	logIn() {
		window.location = `https://accounts.google.com/o/oauth2/v2/auth?
			client_id=891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com&
			response_type=code&
			scope=https://www.googleapis.com/auth/plus.me&
			redirect_uri=${location.protocol}//${location.host}/login/google`;
	}
	logOut() {
		const url = `${location.protocol}//${location.host}/logout`;
		request({ url, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			location.reload();
		});
	}
	render() {
		const containerStyle = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-around',
			position: 'fixed',
			zIndex: 5,
			width: '100%',
			height: '12%',
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
			cursor: 'pointer',
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
					<img
						src={`${location.protocol}//${location.host}/img/logo/dark-blue.svg`}
						alt="Aquaforces" style={logoStyle} />
				</a>
				<a href="/console" style={headerItemStyle} key={0}><span style={linkTextStyle}>Question Sets</span></a>
				<a href="/host" style={headerItemStyle} key={1}><span style={linkTextStyle}>Start a game</span></a>
				<a href="/play" style={headerItemStyle} key={2}><span style={linkTextStyle}>Join a game</span></a>
				{this.props.currentUser
				? <div style={userInfoStyle} key={3}>
						<span style={linkTextStyle}>Logged in as {this.props.currentUser.displayName}</span>
						<a onClick={this.logOut} style={logoutStyle}>(Logout)</a>
					</div>
				: <PrimaryButton onClick={this.logIn}>Log in</PrimaryButton>
				}
			</div>
		);
	}
}

HeaderRaw.propTypes = {
	currentUser: PropTypes.any,
};

export function UnderHeader() {
	const style = {
		height: '12vh',
		width: '100%',
	};
	return <div style={style} />;
}

export const Header = new Radium(HeaderRaw);
