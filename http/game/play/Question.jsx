import React, { Component, PropTypes } from 'react';

function Question({ text }) {
	return (
		<h2 id="question">{text}</h2>
	);
}

export default Question;
