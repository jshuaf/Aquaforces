import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { Header, UnderHeader } from '../shared/Header.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';

function QuestionConsole({ children }) {
	return (
		<div id="questionConsole">
			<Header />
			<UnderHeader />
				<h1>Question Console</h1>
				<Link to="/console/new"><PrimaryButton>New Set</PrimaryButton></Link>
				<Link to="/console/"><PrimaryButton>View Sets</PrimaryButton></Link>
			{children}
		</div>
	);
}

QuestionConsole.propTypes = {
	children: PropTypes.any.isRequired,
};

export default QuestionConsole;
