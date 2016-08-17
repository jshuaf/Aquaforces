import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TextInput, Checkbox } from '../shared/Input.jsx';
import QuestionInputGroupHandler from './QuestionInputGroup.jsx';
import { editSetTitle } from './actions';

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
				<TextInput
					label="Title" placeholder="My Question Set"
					ref={(t) => { this.titleInput = t; }}
					onChange={() => { this.props.dispatch(editSetTitle(this.titleInput.node.value)); }}
				/>
				<QuestionInputGroupHandler />
				<Checkbox label="Private set" />
				<button onClick={this.submitQuestionSet}>Submit</button>
			</div>
		);
	}
}

NewSetForm.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

/* eslint-disable no-class-assign */
NewSetForm = connect()(NewSetForm);
/* eslint-enable no-class-assign */

export default QuestionConsole;
