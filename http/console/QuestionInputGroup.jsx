import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ExpandButton from '../shared/ExpandButton.jsx';
import QuestionInput from './QuestionInput.jsx';
import { addQuestionInput } from './actions';

function QuestionInputGroupDisplay({ questions, addQuestionInput, mode }) {
	return (
		<div id="question_input_group">
			<h3>Questions</h3>
			<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
			<br />
			{questions.map((question) =>
				<QuestionInput key={question.id} question={question} mode={mode} />
			)}
			<ExpandButton onClick={() => { addQuestionInput(mode); }}>{'+ Add a question'}</ExpandButton>
		</div>
	);
}

QuestionInputGroupDisplay.propTypes = {
	addQuestionInput: PropTypes.func.isRequired,
	questions: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string.isRequired,
		correctAnswer: PropTypes.string.isRequired,
		incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
			text: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
		})).isRequired,
		id: PropTypes.number.isRequired,
	})).isRequired,
	mode: PropTypes.oneOf(['edit', 'new']).isRequired,
};

const mapDispatchToProps = (dispatch) => ({
	addQuestionInput: (mode) => {
		dispatch(addQuestionInput(mode));
	},
});

const QuestionInputGroup = connect(
	null,
	mapDispatchToProps
)(QuestionInputGroupDisplay);

export default QuestionInputGroup;
