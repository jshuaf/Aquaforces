import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { ExpandButton } from '../shared/Input.jsx';
import QuestionInput from './QuestionInput.jsx';
import { addQuestionInput } from './actions';

function QuestionInputGroup({ questions, addQuestionInput }) {
	return (
		<div id="question_input_group">
			<h3>Questions</h3>
			<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
			<br />
			{questions.map((question) =>
				<QuestionInput key={question.id} question={question} />
			)}
			<ExpandButton onClick={addQuestionInput} />
		</div>
	);
}

QuestionInputGroup.propTypes = {
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
};

const mapStateToProps = (state) => ({
	questions: state.newQuestionSet.questions,
});

const mapDispatchToProps = (dispatch) => ({
	addQuestionInput: () => {
		dispatch(addQuestionInput());
	},
});

const QuestionInputGroupHandler = connect(
	mapStateToProps,
	mapDispatchToProps
)(QuestionInputGroup);

export default QuestionInputGroupHandler;
