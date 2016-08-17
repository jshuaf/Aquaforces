import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { TextInput, Checkbox } from '../shared/Input.jsx';
import QuestionInputGroupHandler from './QuestionInputGroup.jsx';
import { editSetTitle, toggleSetPrivacy } from './actions';

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
					onChange={() => { this.props.editSetTitle(this.titleInput.node.value); }}
				/>
				<QuestionInputGroupHandler />
				<Checkbox
					label="Private set" ref={(c) => { this.checkboxInput = c; }}
					onChange={() => { this.props.toggleSetPrivacy(this.checkboxInput.node.checked); }}
				/>
				<button onClick={this.submitQuestionSet}>Submit</button>
			</div>
		);
	}
}

NewSetForm.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	newQuestionSet: state.newQuestionSet,
});

const mapDispatchToProps = (dispatch) => ({
	editSetTitle: (text) => {
		dispatch(editSetTitle(text));
	},
	toggleSetPrivacy: (privacy) => {
		dispatch(toggleSetPrivacy(privacy));
	},
});

/* eslint-disable no-class-assign */
NewSetForm = connect(mapStateToProps, mapDispatchToProps)(NewSetForm);
/* eslint-enable no-class-assign */

export default QuestionConsole;
