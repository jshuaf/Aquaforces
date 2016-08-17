import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { TextInput, Checkbox, ExpandButton } from '../shared/Input.jsx';
import questionConsoleReducer from './reducers';
import { addQuestionInput } from './actions';
import QuestionInputGroup from './QuestionInputGroup.jsx';

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

export default QuestionConsole;
