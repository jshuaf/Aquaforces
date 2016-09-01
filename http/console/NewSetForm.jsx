import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionInputGroup from './QuestionInputGroup.jsx';
import TextInput from '../shared/TextInput.jsx';
import Checkbox from '../shared/Checkbox.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { editSetTitle, toggleSetPrivacy, addSet } from './actions';

/* global sweetAlert:true */

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
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			this.props.addSet(set);
		});
	}
	render() {
		return (
			<form id="new_set" onSubmit={(e) => e.preventDefault()}>
				<h3>New Question Set</h3>
				<TextInput
					label="Title" placeholder="My Question Set" required
					value={this.props.newQuestionSet.title}
					ref={(t) => { this.titleInput = t; }}
					onChange={() => { this.props.editSetTitle(this.titleInput.node.value); }}
				/>
				<QuestionInputGroup />
				<Checkbox
					label="Private set" ref={(c) => { this.checkboxInput = c; }}
					checked={this.props.newQuestionSet.privacy}
					onChange={() => { this.props.toggleSetPrivacy(this.checkboxInput.node.checked); }}
				/>
			<input onClick={this.submitQuestionSet} type="submit" className="button button-primary" name="Submit" />
			</form>
		);
	}
}

NewSetForm.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	addSet: PropTypes.func.isRequired,
	newQuestionSet: PropTypes.shape(questionSetPropTypes).isRequired,
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
