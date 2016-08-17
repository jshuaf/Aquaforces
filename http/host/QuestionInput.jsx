import React, { PropTypes } from 'react';
import { ExpandButton, TextInput } from '../shared/Input.jsx';

class QuestionInput extends React.Component {
	constructor(props) {
		super(props);
		this.addAnswerInput = this.addAnswerInput.bind(this);
		this.updateAnswerData = this.updateAnswerData.bind(this);
		this.updateQuestion = this.updateQuestion.bind(this);
		this.state = {
			numberOfAnswers: 1,
			answers: [<TextInput
				placeholder="Twenty one." label="Answer"
				key={0} onchange={this.updateAnswerData} id={0}
			/>],
			answerData: [null],
			question: null,
		};
	}

	updateAnswerData(text, index) {
		const answerData = this.state.answerData.slice();
		answerData[index] = text;
		this.setState({ answerData });
	}

	updateQuestion(question) {
		this.setState({ question });
	}

	addAnswerInput() {
		this.setState((previousState, previousProps) => ({
			numberOfAnswers: previousState.numberOfAnswers + 1,
			answers: previousState.answers.concat(
				<TextInput
					placeholder="Twenty one." label="Answer" id={previousState.numberOfAnswers}
					key={previousState.numberOfAnswers} onchange={this.updateAnswerData}
				/>
			),
			answerData: previousState.answerData.concat(null),
		}));
	}

	render() {
		return (<div className="question_input">
			<TextInput placeholder="What's nine plus ten?" label="Question" onchange={this.updateQuestion} />
			<div className="answers_input">
				{this.state.answers}
			</div>
			<ExpandButton onClick={this.addAnswerInput} />
		</div>);
	}
}

export default QuestionInput;
