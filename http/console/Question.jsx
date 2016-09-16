import React, { Component, PropTypes } from 'react';
import PrimaryButton from '../shared/PrimaryButton.jsx';
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
	const buttonStyle = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '45px',
		width: '45px',
		padding: 0,
		minWidth: 0,
	};
	const imageStyle = { margin: '30%' };
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
				{window.location.href.indexOf('/edit') > 0 ?
					<div className="two columns text-right">
					<PrimaryButton style={buttonStyle}>
						<img src="/img/icons/trash.svg" style={imageStyle} alt="Delete" />
					</PrimaryButton>
					<PrimaryButton style={buttonStyle}>
						<img src="/img/icons/pencil.svg" style={imageStyle} alt="Edit" />
					</PrimaryButton>
				</div>
				: null
				}
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
	const textStyle = { color: colors.midnight, fontWeight: 'bold' };
	const imageStyle = { paddingRight: '4%' };
	return (
		<div>
			<img src="/img/icons/checkmark.svg" alt="Correct: " style={imageStyle} />
			<span style={textStyle}>{text}</span>
		</div>
	);
};

CorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

const IncorrectAnswer = function ({ text }) {
	const textStyle = { color: colors.midnight };
	const imageStyle = { paddingRight: '5%' };
	return (
		<div>
			<img src="/img/icons/x.svg" alt="Incorrect: " style={imageStyle} />
			<span style={textStyle}>{text}</span>
		</div>
	);
};

IncorrectAnswer.propTypes = {
	text: PropTypes.string.isRequired,
};

export default Question;
