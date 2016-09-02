import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import QuestionInputGroup from './QuestionInputGroup.jsx';
import TextInput from '../shared/TextInput.jsx';
import Checkbox from '../shared/Checkbox.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { editSetTitle, toggleSetPrivacy } from './actions';
import { submitQuestionSet } from './thunks';

class NewSetFormDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	verifyQuestionSet() {
		const set = this.props.newQuestionSet;
		if (!set.title) {
			this.titleInput.error('Need a set title.');
			return false;
		}
		this.titleInput.clearError();
		return true;
	}
	submitQuestionSet() {
		if (this.verifyQuestionSet()) {
			const set = this.props.newQuestionSet;
			this.props.submitQuestionSet(set);
		}
	}
	render() {
		return (
			<form id="new_set" onSubmit={(e) => { e.preventDefault(); this.submitQuestionSet(); }}>
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
			<input type="submit" className="button button-primary" name="Submit" />
			</form>
		);
	}
}

NewSetFormDisplay.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	submitQuestionSet: PropTypes.func.isRequired,
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
	submitQuestionSet: (set) => {
		dispatch(submitQuestionSet(set));
	},
});

const NewSetForm = connect(mapStateToProps, mapDispatchToProps)(NewSetFormDisplay);

export default NewSetForm;
