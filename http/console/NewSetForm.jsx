import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionInputGroupHandler from './QuestionInputGroup.jsx';
import { TextInput, Checkbox } from '../shared/Input.jsx';
import { editSetTitle, toggleSetPrivacy, addSet } from './actions';

const request = require('request');

class NewSetForm extends Component {
	constructor(props) {
		super(props);
		this.submitQuestionSet = this.submitQuestionSet.bind(this);
		this.verifyQuestionSet = this.verifyQuestionSet.bind(this);
	}
	verifyQuestionSet() {
		const set = this.props.newQuestionSet;
		if (!set.title) {
			this.titleInput.error('Need a set title.');
		} else {
			this.titleInput.clearError();
		}
	}
	submitQuestionSet() {
		this.verifyQuestionSet();
		const set = this.props.newQuestionSet;
		const url = `${location.protocol}//${location.host}/api/new-qset`;
		request({
			url,
			method: 'post',
			json: true,
			body: set,
		}, (error) => {
			if (error) return console.error(error);
			this.props.addSet(set);
		});
	}
	render() {
		return (
			<form id="new_set" onSubmit={(e) => e.preventDefault()}>
				<h2>New Question Set</h2>
				<TextInput
					label="Title" placeholder="My Question Set" required
					ref={(t) => { this.titleInput = t; }}
					onChange={() => { this.props.editSetTitle(this.titleInput.node.value); }}
				/>
				<QuestionInputGroupHandler />
				<Checkbox
					label="Private set" ref={(c) => { this.checkboxInput = c; }}
					onChange={() => { this.props.toggleSetPrivacy(this.checkboxInput.node.checked); }}
				/>
			<input onClick={this.submitQuestionSet} type="submit" name="Submit" />
			</form>
		);
	}
}

NewSetForm.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	addSet: PropTypes.func.isRequired,
	newQuestionSet: PropTypes.shape({
		title: PropTypes.string.isRequired,
		nextQuestionID: PropTypes.number.isRequired,
		questions: PropTypes.arrayOf(PropTypes.shape({
			text: PropTypes.string.isRequired,
			correctAnswer: PropTypes.string.isRequired,
			incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
				text: PropTypes.string.isRequired,
				id: PropTypes.number.isRequired,
			})).isRequired,
			id: PropTypes.number.isRequired,
		})).isRequired,
		privacy: PropTypes.bool.isRequired,
	}),
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
	addSet: (set) => {
		dispatch(addSet(set));
	},
});

/* eslint-disable no-class-assign */
NewSetForm = connect(mapStateToProps, mapDispatchToProps)(NewSetForm);
/* eslint-enable no-class-assign */

export default NewSetForm;