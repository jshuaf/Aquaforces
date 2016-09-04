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
			textAlign: 'left',
			marginTop: '25px',
		};

		const logoContainerStyle = {
			display: 'inline-table',
			alignItems: 'left',
		};

		const logoStyle = {
			height: '80%',
			width: '20vw',
			maxWidth: '200px',
			marginRight: '15px',
		};

		const userInfoStyle = {
			height: '80%',
			display: 'inline-table',
			marginRight: '15px',
			verticalAlign: 'top',
			alignItems: 'left',
			textDecoration: 'none',
			fontSize: '1.3em',
			color: colors.water,
		};

		const logoutStyle = {
			color: colors.water,
			fontSize: '1em',
			textDecoration: 'none',
			':hover': { color: colors.pacific },
			marginLeft: '5px',
		};

		const headerItemStyle = Object.assign({}, userInfoStyle, {
			':hover': { color: colors.pacific } }
		);

		const linkStyle = {
			color: colors.water,
		};

		return (
			<div className="container" id="header" style={containerStyle}>
				<div className="row">
					<div className="twelve columns">
						<a href="/" style={logoContainerStyle}>
							<img
								src={`${location.protocol}//${location.host}/img/logo/new-blue.svg`}
								alt="Aquaforces" style={logoStyle} className="mobileless" />
							<a style={headerItemStyle} className="mobile-only"><b>Aquaforces</b></a>
						</a>
						<a href="/console" style={headerItemStyle} key={0}><span style={linkStyle}>Sets</span></a>
						<a href="/host" style={headerItemStyle} key={1}><span style={linkStyle}>Host</span></a>
						<a href="/play" style={headerItemStyle} key={2}><span style={linkStyle}>Join</span></a>
						{this.props.currentUser
						? <div style={userInfoStyle} className="mobileless" key={3}>
								<span style={linkStyle}>{this.props.currentUser.displayName}</span>
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

export function UnderHeader() {
	const style = {
		height: '2vh',
		width: '100%',
	};
	return <div style={style} />;
}

export const Header = new Radium(HeaderRaw);
