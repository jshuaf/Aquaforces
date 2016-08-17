import React, { PropTypes } from 'react';
import { ExpandButton } from '../shared/Input.jsx';
import QuestionInput from './QuestionInput.jsx';

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

export default QuestionInputGroup;
