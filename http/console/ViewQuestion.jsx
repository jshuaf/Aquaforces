import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import colors from '../shared/colors';
import { deleteQuestion, addAnswerInput,
	editQuestionText } from './actions';

function ViewQuestionDisplay({ text, correctAnswer, id, incorrectAnswers }) {
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
					<CorrectAnswer text={correctAnswer} id={id} />
						{incorrectAnswers.map((incorrectAnswer, index) =>
							<IncorrectAnswer
								text={incorrectAnswer.text} key={index}
								questionID={id} id={incorrectAnswer.id}
							/>
					)}
				</div>
			</div>
		</div>
	);
}

ViewQuestionDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	correctAnswer: PropTypes.string.isRequired,
	incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string.isRequired,
		id: PropTypes.number.isRequired,
	})).isRequired,
	id: PropTypes.number,
};

const mapDispatchToProps = { deleteQuestion, addAnswerInput, editQuestionText };

const ViewQuestion = connect(null, mapDispatchToProps)(ViewQuestionDisplay);

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
	id: PropTypes.number.isRequired,
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
	id: PropTypes.number.isRequired,
	questionID: PropTypes.number.isRequired,
};

export default ViewQuestion;
