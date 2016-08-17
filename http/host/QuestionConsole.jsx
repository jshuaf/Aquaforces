import React, { PropTypes } from 'react';
import { TextInput, Checkbox } from '../shared/Input.jsx';
import QuestionInputGroupHandler from './QuestionInputGroup.jsx';

function QuestionConsole() {
	return (
		<NewSetForm />
	);
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
				<QuestionInputGroupHandler />
				<Checkbox label="Private set" />
				<button onClick={this.submitQuestionSet}>Submit</button>
			</div>
		);
	}
}

export default QuestionConsole;
