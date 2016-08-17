import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ExpandButton, TextInput } from '../shared/Input.jsx';
import { addAnswerInput, editCorrectAnswer, editIncorrectAnswer, editQuestionText } from './actions';

function QuestionInput({ dispatch, question }) {
	return (
		<div className="question_input">
			<TextInput
				placeholder="What's nine plus ten?" label="Question"
				onchange={() => { dispatch(editQuestionText(question.id, this.value)); }}
			/>
			<div className="answers_input">
			{
				question.incorrectAnswers.map((answer, index) => {
					if (index === 0) {
						return (<TextInput
							placeholder="Twenty one." label="Answer"
							id={answer.id} key={answer.id}
							onchange={() => { dispatch(editCorrectAnswer(question.id, this.value)); }}
						/>);
					}
					return (<TextInput
						placeholder="Twenty one." label="Answer"
						id={answer.id} key={answer.id}
						onchange={() => { dispatch(editIncorrectAnswer(question.id, answer.id, this.value)); }}
					/>);
				})
			}
			</div>
			<ExpandButton onClick={() => { dispatch(addAnswerInput(question.id)); }} />
		</div>
	);
}

QuestionInput.propTypes = {
	dispatch: PropTypes.func.isRequired,
	question: PropTypes.shape({
		text: PropTypes.string.isRequired,
		correctAnswer: PropTypes.string.isRequired,
		incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
			text: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
		})).isRequired,
		id: PropTypes.number.isRequired,
	}).isRequired,
};

/* eslint-disable no-func-assign */
QuestionInput = connect()(QuestionInput);
/* eslint-enable no-func-assign */

export default QuestionInput;
