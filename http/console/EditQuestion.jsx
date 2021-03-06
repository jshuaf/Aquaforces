import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import colors from '../shared/colors';
import { deleteQuestion, addAnswerInput,
	editQuestionText, editCorrectAnswer, editIncorrectAnswer, deleteAnswer } from './actions';

class EditQuestionDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	deleteQuestion() {
		this.props.deleteQuestion(this.props.id, this.props.mode);
	}
	addIncorrectAnswer() {
		this.props.addAnswerInput(this.props.id, this.props.mode);
	}
	render() {
		const containerStyle = {
			padding: '20px',
			borderRadius: '20px',
			marginBottom: '20px',
			border: `2px solid ${colors.midnight}`,
			backgroundColor: colors.ice,
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
						<TextInput
							value={this.props.text} ref={(t) => { this.titleInput = t; }}
							onChange={() => {
								this.props.editQuestionText(this.props.id, this.titleInput.node.value, this.props.mode);
							}}
						/>
						<CorrectAnswer text={this.props.correctAnswer} id={this.props.id} mode={this.props.mode} />
							{this.props.incorrectAnswers.map((incorrectAnswer, index) =>
								<IncorrectAnswer
									text={incorrectAnswer.text} key={index}
									questionID={this.props.id} id={incorrectAnswer.id}
									mode={this.props.mode}
								/>
							)}
					</div>
					<div className="two columns text-right">
						<PrimaryButton style={buttonStyle} onClick={this.deleteQuestion}>
							<img src="/img/icons/trash-light.svg" style={imageStyle} alt="Delete" />
						</PrimaryButton>
						<PrimaryButton style={buttonStyle} onClick={this.addIncorrectAnswer}>
							<img src="/img/icons/plus.svg" style={imageStyle} alt="Add" />
						</PrimaryButton>
					</div>
				</div>
			</div>
		);
	}
}

EditQuestionDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	correctAnswer: PropTypes.string.isRequired,
	incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string.isRequired,
		id: PropTypes.number.isRequired,
	})).isRequired,
	id: PropTypes.number,
	deleteQuestion: PropTypes.func.isRequired,
	addAnswerInput: PropTypes.func.isRequired,
	editQuestionText: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(['edit', 'create']).isRequired,
};

const mapDispatchToProps = { deleteQuestion, addAnswerInput, editQuestionText };

const EditQuestion = connect(null, mapDispatchToProps)(EditQuestionDisplay);

const CorrectAnswerDisplay = function ({ text, id, editCorrectAnswer, mode }) {
	const imageStyle = { paddingRight: '4%' };
	let input;
	return (
	<div>
		<img src="/img/icons/checkmark.svg" alt="Correct: " style={imageStyle} />
			<TextInput
				value={text}
				onChange={() => { editCorrectAnswer(id, input.node.value, mode); }}
				ref={(t) => { input = t; }} />
	</div>
);
};

CorrectAnswerDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	id: PropTypes.number.isRequired,
	editCorrectAnswer: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(['edit', 'create']).isRequired,
};

const CorrectAnswer = connect(null, { editCorrectAnswer })(CorrectAnswerDisplay);

const IncorrectAnswerDisplay = function ({ text, questionID, id, editIncorrectAnswer, deleteAnswer, mode }) {
	const imageStyle = { paddingRight: '5%' };
	const deleteStyle = { cursor: 'pointer' };
	let input;
	return (
	<div>
		<img src="/img/icons/x.svg" alt="Incorrect: " style={imageStyle} />
      <div>
				<TextInput
					value={text}
					onChange={() => { editIncorrectAnswer(questionID, id, input.node.value, mode); }}
					ref={(t) => { input = t; }}
				/>
				<img
					src="/img/icons/trash-dark.svg" alt="Delete" style={deleteStyle}
					onClick={() => { deleteAnswer(questionID, id, this.props.mode); }}
					/>
			</div>
	</div>
);
};

IncorrectAnswerDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	id: PropTypes.number.isRequired,
	questionID: PropTypes.number.isRequired,
	editIncorrectAnswer: PropTypes.func.isRequired,
	deleteAnswer: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(['edit', 'create']).isRequired,
};

const IncorrectAnswer = connect(null, { editIncorrectAnswer, deleteAnswer })(IncorrectAnswerDisplay);

export default EditQuestion;
