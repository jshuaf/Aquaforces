import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { Header, UnderHeader } from '../shared/Header.jsx';

function QuestionConsole({ children }) {
	return (
		<div id="questionConsole">
			<Header />
			<UnderHeader />
				<h1>Question Console</h1>
				<Link to="/console/new"><button>New Set</button></Link>
				<Link to="/console/"><button>View Sets</button></Link>
			{children}
		</div>
	);
}

QuestionConsole.propTypes = {
	children: PropTypes.any.isRequired,
};

export default QuestionConsole;
