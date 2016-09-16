import React, { Component, PropTypes } from 'react';
import colors from '../shared/colors';

const Question = function ({ text, correctAnswer, incorrectAnswers }) {
	const containerStyle = {
		padding: '20px',
		borderRadius: '20px',
		marginBottom: '20px',
		border: `2px solid ${colors.midnight}`,
		backgroundColor: colors.ice,
	};
	const textStyle = {
		color: colors.midnight,
		fontWeight: 'bold',
	};
	return (
		<div style={containerStyle} className="six columns">
			<div className="row">
				<div className="ten columns">
					<h3 style={textStyle}>{text}</h3>
						<CorrectAnswer text={correctAnswer} />
						{incorrectAnswers.map((incorrectAnswer, index) =>
							<IncorrectAnswer text={incorrectAnswer.text} key={index} />
						)}
				</div>
				<div className="two columns text-right">
					<button>Delete Question</button>
					<button>Edit Question</button>
				</div>
			</div>
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
	const textStyle = { color: colors.midnight };
	return (
		<div>
			<img src="../img/icons/checkmark.svg" alt="Correct: " />
			<span style={textStyle}>{text}</span>
		</div>
	);
};

CorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

const IncorrectAnswer = function ({ text }) {
	const textStyle = { color: colors.midnight };
	return (
		<div>
			<img src="../img/icons/x.svg" alt="Incorrect: " />
			<span style={textStyle}>{text}</span>
		</div>
	);
};

IncorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

export default Question;
