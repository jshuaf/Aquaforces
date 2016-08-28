import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

function QuestionConsole({ children }) {
	return (
		<div id="questionConsole">
			<h1>Question Console</h1>
			<Link to="/console/new">New Set</Link>
			<Link to="/console/">View Sets</Link>
			{children}
		</div>
	);
}

QuestionConsole.propTypes = {
	children: PropTypes.any.isRequired,
};

export default QuestionConsole;
