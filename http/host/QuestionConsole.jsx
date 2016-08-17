import React, { PropTypes } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { TextInput, Checkbox, ExpandButton } from '../shared/Input.jsx';
import questionConsoleReducer from './reducers';
import { addQuestionInput } from './actions';

class QuestionConsole extends React.Component {
	render() {
		return (
			<NewSetForm />
		);
	}
}

class NewSetForm extends React.Component {
	constructor(props) {
		super(props);
		this.submitQuestionSet = this.submitQuestionSet.bind(this);
	}
	submitQuestionSet() {
		// TODO: add question set submission functionality
	}
	render() {
		return (
			<div id="new_set">
				<h2>New Question Set</h2>
				<TextInput label="Title" placeholder="My Question Set" ref={(t) => { this.title = t; }} />
				<QuestionInputGroup />
				<Checkbox label="Private set" />
				<button onClick={this.submitQuestionSet}>Submit</button>
			</div>
		);
	}
}

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

export default QuestionConsole;
