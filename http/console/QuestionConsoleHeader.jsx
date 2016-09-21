import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import SearchBar from './SearchBar.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';

export default function QuestionConsoleHeader() {

	const headerStyle = {
		marginBottom: '1%',
	};
	return (
		<div className="row">
			<div className="twelve columns">
			<h1 style={headerStyle}>Question Console</h1>
				<Link to="/console/new">
					<PrimaryButton>New Set</PrimaryButton>
				</Link>
				<Link to="/console/">
					<PrimaryButton>My Sets</PrimaryButton>
				</Link>
			<SearchBar />
			</div>
		</div>
	);
}
