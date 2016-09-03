import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ExpandButton from '../shared/ExpandButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import { addAnswerInput, editCorrectAnswer, editIncorrectAnswer, editQuestionText } from './actions';

function QuestionInputDisplay({ dispatch, question, mode }) {
	const incorrectAnswerInputs = {};
	let correctAnswerInput;
	let questionTextInput;
	return (
		<div>
			<TextInput
				placeholder="What's nine plus ten?" label="Question" required
				ref={(component) => { questionTextInput = component; }} value={question.text}
				onChange={() => { dispatch(editQuestionText(question.id, questionTextInput.node.value, mode)); }}
			/>
			<div className="answers_input">
				<TextInput
					placeholder="Twenty one." label="Correct Answer" key={0} required value={question.correctAnswer}
					onChange={() => { dispatch(editCorrectAnswer(question.id, correctAnswerInput.node.value, mode)); }}
					ref={(component) => { correctAnswerInput = component; }}
				/>
			{
				question.incorrectAnswers.map((answer) =>
					<TextInput
						placeholder="Twenty one." label="Incorrect Answer"
						id={answer.id} key={answer.id}
						onChange={() => {
							const input = incorrectAnswerInputs[answer.id];
							if (input) dispatch(editIncorrectAnswer(question.id, answer.id, input.node.value, mode));
						}}
						ref={(component) => { incorrectAnswerInputs[answer.id] = component; }}
						value={answer.text}
					/>)
			}
			</div>
			<ExpandButton onClick={() => { dispatch(addAnswerInput(question.id, mode)); }}>
				{'+ Add an incorrect answer'}
			</ExpandButton>
		</div>
	);
}

QuestionInputDisplay.propTypes = {
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
	mode: PropTypes.oneOf(['edit', 'create']).isRequired,
};

const QuestionInput = connect()(QuestionInputDisplay);

export default QuestionInput;
