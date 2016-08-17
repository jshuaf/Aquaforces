import React from 'react';
import { connect } from 'react-redux';
import { ExpandButton } from '../shared/Input.jsx';
import QuestionInput from './QuestionInput.jsx';
import { addQuestionInput } from './actions';

class QuestionInputGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numberOfQuestions: 1,
		};
		this.addQuestionInput = this.addQuestionInput.bind(this);
	}
	addQuestionInput() {
		this.setState((previousState, previousProps) => ({
			numberOfQuestions: previousState.numberOfQuestions + 1,
		}));
	}
	render() {
		const questionInputs = [];
		for (let i = 0; i < this.state.numberOfQuestions; i++) {
			questionInputs.push(<QuestionInput key={i} />);
		}
		return (
			<div id="question_input_group">
				<h3>Questions</h3>
				<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
				<br />
				{questionInputs}
				<ExpandButton onClick={this.addQuestionInput} />
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	questions: state.questions,
});

const mapDispatchToProps = (dispatch) => ({
	onAddQuestionInput: () => {
		dispatch(addQuestionInput());
	},
});

const QuestionInputGroupHandler = connect(
	mapStateToProps,
	mapDispatchToProps
)(QuestionInputGroup);

export default QuestionInputGroupHandler;
