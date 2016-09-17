import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import colors from '../shared/colors';
import { deleteQuestion, addAnswerInput,
	editQuestionText, editCorrectAnswer, editIncorrectAnswer } from './actions';

class QuestionDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	deleteQuestion() {
		this.props.deleteQuestion(this.props.id, 'edit');
	}
	addIncorrectAnswer() {
		this.props.addAnswerInput(this.props.id, 'edit');
	}
	render() {
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
		if (this.props.route.path.indexOf('/edit') >= 0) {
			return (
			<div style={containerStyle} className="six columns">
				<div className="row">
					<div className="ten columns">
						<TextInput
							value={this.props.text} ref={(t) => { this.titleInput = t; }}
							onChange={() => {
								this.props.editQuestionText(this.props.id, this.titleInput.node.value, 'edit');
							}}
						/>
						<CorrectAnswer text={this.props.correctAnswer} route={this.props.route} id={this.props.id} />
							{this.props.incorrectAnswers.map((incorrectAnswer, index) =>
								<IncorrectAnswer
									text={incorrectAnswer.text} key={index} route={this.props.route}
									questionID={this.props.id} id={incorrectAnswer.id}
								/>
							)}
					</div>
					<div className="two columns text-right">
						<PrimaryButton style={buttonStyle} onClick={this.deleteQuestion}>
							<img src="/img/icons/trash.svg" style={imageStyle} alt="Delete" />
						</PrimaryButton>
						<PrimaryButton style={buttonStyle} onClick={this.addIncorrectAnswer}>
							<img src="/img/icons/plus.svg" style={imageStyle} alt="Add" />
						</PrimaryButton>
					</div>
				</div>
			</div>
		);
		}
		return (
		<div style={containerStyle} className="six columns">
			<div className="row">
				<div className="ten columns">
					<h3 style={textStyle}>{this.props.text}</h3>
						<CorrectAnswer text={this.props.correctAnswer} route={this.props.route} id={this.props.id} />
						{this.props.incorrectAnswers.map((incorrectAnswer, index) =>
							<IncorrectAnswer
								text={incorrectAnswer.text} key={index} route={this.props.route}
								questionID={this.props.id} id={incorrectAnswer.id}
							/>
						)}
				</div>
			</div>
		</div>
	);
	}
}

QuestionDisplay.propTypes = {
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
	route: PropTypes.any.isRequired,
};

const mapDispatchToProps = { deleteQuestion, addAnswerInput, editQuestionText };

const Question = connect(null, mapDispatchToProps)(QuestionDisplay);

const CorrectAnswerDisplay = function ({ text, route, id, editCorrectAnswer }) {
	const textStyle = { color: colors.midnight, fontWeight: 'bold' };
	const imageStyle = { paddingRight: '4%' };
	let input;
	return (
	<div>
		<img src="/img/icons/checkmark.svg" alt="Correct: " style={imageStyle} />
		{route.path.indexOf('/edit') >= 0 ?
			<TextInput
				value={text}
				onChange={() => { editCorrectAnswer(id, input.node.value, 'edit'); }}
				ref={(t) => { input = t; }} />
		: <span style={textStyle}>{text}</span>}
	</div>
);
};

CorrectAnswerDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	route: PropTypes.any.isRequired,
	id: PropTypes.number.isRequired,
	editCorrectAnswer: PropTypes.func.isRequired,
};

const CorrectAnswer = connect(null, { editCorrectAnswer })(CorrectAnswerDisplay);

const IncorrectAnswerDisplay = function ({ text, route, questionID, id, editIncorrectAnswer }) {
	const textStyle = { color: colors.midnight };
	const imageStyle = { paddingRight: '5%' };
	let input;
	return (
	<div>
		<img src="/img/icons/x.svg" alt="Incorrect: " style={imageStyle} />
			{route.path.indexOf('/edit') >= 0 ?
				<TextInput
					value={text}
					onChange={() => { editIncorrectAnswer(questionID, id, input.node.value, 'edit'); }}
					ref={(t) => { input = t; }}
				/>
			: <span style={textStyle}>{text}</span>}
	</div>
);
};

IncorrectAnswerDisplay.propTypes = {
	text: PropTypes.string.isRequired,
	route: PropTypes.any.isRequired,
	id: PropTypes.number.isRequired,
	questionID: PropTypes.number.isRequired,
	editIncorrectAnswer: PropTypes.func.isRequired,
};

const IncorrectAnswer = connect(null, { editIncorrectAnswer })(IncorrectAnswerDisplay);

export default Question;
