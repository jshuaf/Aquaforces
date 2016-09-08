import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import SearchBar from './SearchBar.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';

export default function QuestionConsoleHeader() {
	const containerStyle = {
		marginBottom: '0.5%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	};
	const headerStyle = {
		marginBottom: '1%',
	};
	const linkStyle = {
		padding: '0 2% 0 2%',
	};
	const buttonStyle = {
		fontSize: '1.1em',
		height: '30px',
		lineHeight: 'normal',
		minWidth: '100px',
		padding: 0,
	};
	return (
		<div className="row text-center">
			<h1 style={headerStyle}>Question Console</h1>
			<div style={containerStyle}>
				<Link to="/console/new" style={linkStyle}>
					<PrimaryButton style={buttonStyle}>New Set</PrimaryButton>
				</Link>
				<Link to="/console/" style={linkStyle}>
					<PrimaryButton style={buttonStyle}>My Sets</PrimaryButton>
				</Link>
			</div>
			<SearchBar />
		</div>
	);
}
