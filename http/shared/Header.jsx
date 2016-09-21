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
		const headerStyle = {
			marginTop: '25px',
			marginBottom: '25px',
		};

		const logoStyle = {
			width: '150px',
			marginRight: '15px',
		};

		const userInfoStyle = {
			height: '80%',
			display: 'inline',
			justifyContent: 'center',
			alignItems: 'center',
			textDecoration: 'none',
			fontSize: '1.3em',
			marginRight: '15px',
			color: colors.pacific,
		};

		const logoutStyle = {
			color: colors.pacific,
			fontSize: '1em',
			textDecoration: 'none',
			':hover': { color: colors.water },
			marginLeft: '5px',
		};

		const hIStyle = Object.assign({}, userInfoStyle, {
			':hover': { color: colors.pacific } }
		);

		const linkTextStyle = {
			color: 'inherit',
		};

		return (
			<div className="container" style={headerStyle}>
				<div className="row">
					<div className="twelve columns">
						<a href="/">
							<img
								src={`${location.protocol}//${location.host}/img/logo/dark-blue.svg`}
								alt="Aquaforces" style={logoStyle} />
						</a>
						<a href="/console" style={hIStyle} key={0}><span style={linkTextStyle}>Question Sets</span></a>
						<a href="/host" style={hIStyle} key={1}><span style={linkTextStyle}>Start a game</span></a>
						<a href="/play" style={hIStyle} key={2}><span style={linkTextStyle}>Join a game</span></a>
						{this.props.currentUser
						? <div style={userInfoStyle} key={3}>
								<span style={linkTextStyle}>Logged in as {this.props.currentUser.displayName}</span>
								<a onClick={this.logOut} style={logoutStyle}>(Logout)</a>
							</div>
						: <PrimaryButton onClick={this.logIn}>Log in</PrimaryButton>
						}
					</div>
				</div>
			</div>
		);
	}
}

HeaderRaw.propTypes = {
	currentUser: PropTypes.any,
};
export const Header = new Radium(HeaderRaw);
