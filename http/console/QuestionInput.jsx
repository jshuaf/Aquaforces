import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ExpandButton, TextInput } from '../shared/Input.jsx';
import { addAnswerInput, editCorrectAnswer, editIncorrectAnswer, editQuestionText } from './actions';

function QuestionInput({ dispatch, question }) {
	const incorrectAnswerInputs = {};
	let correctAnswerInput;
	let questionTextInput;
	return (
		<div className="question_input">
			<TextInput
				placeholder="What's nine plus ten?" label="Question" required
				ref={(component) => { questionTextInput = component; }}
				onChange={() => { dispatch(editQuestionText(question.id, questionTextInput.node.value)); }}
			/>
			<div className="answers_input">
				<TextInput
					placeholder="Twenty one." label="Correct Answer" key={0} required
					onChange={() => { dispatch(editCorrectAnswer(question.id, correctAnswerInput.node.value)); }}
					ref={(component) => { correctAnswerInput = component; }}
				/>
			{
				question.incorrectAnswers.map((answer) =>
					<TextInput
						placeholder="Twenty one." label="Incorrect Answer"
						id={answer.id} key={answer.id}
						onChange={() => {
							const input = incorrectAnswerInputs[answer.id];
							if (input) dispatch(editIncorrectAnswer(question.id, answer.id, input.node.value));
						}}
						ref={(component) => { incorrectAnswerInputs[answer.id] = component; }}
					/>)
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
