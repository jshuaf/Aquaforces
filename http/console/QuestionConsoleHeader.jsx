import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import SearchBar from './SearchBar.jsx';
import PrimaryInlineButton from '../shared/PrimaryInlineButton.jsx';

export default function QuestionConsoleHeader() {
	const containerStyle = {
		marginBottom: '2%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	};
	return (
		<div className="row text-center">
			<h1>Question Console</h1>
			<div style={containerStyle}>
				<SearchBar />
				<Link to="/console/new"><PrimaryInlineButton>New Set</PrimaryInlineButton></Link>
				<Link to="/console/"><PrimaryInlineButton>Browse Sets</PrimaryInlineButton></Link>
			</div>
		</div>
	);
}
