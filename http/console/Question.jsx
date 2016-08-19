import React, { Component, PropTypes } from 'react';

const Question = function ({ text, correctAnswer, incorrectAnswers }) {
	return (
		<div className="question">
			<h4>{text}</h4>
			<CorrectAnswer text={correctAnswer} />
			{incorrectAnswers.map((incorrectAnswer, index) =>
				<IncorrectAnswer text={incorrectAnswer.text} key={index} />
			)}
		</div>
	);
};

Question.propTypes = {
	text: PropTypes.string.isRequired,
	correctAnswer: PropTypes.string.isRequired,
	incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string.isRequired,
		id: PropTypes.number.isRequired,
	})).isRequired,
	id: PropTypes.number,
};

const CorrectAnswer = function ({ text }) {
	return <p>Correct answer: {text}</p>;
};

CorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

const IncorrectAnswer = function ({ text }) {
	return <p>Incorrect answer: {text}</p>;
};

IncorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

export default Question;