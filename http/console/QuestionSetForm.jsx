import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import QuestionInputGroup from './QuestionInputGroup.jsx';
import TextInput from '../shared/TextInput.jsx';
import Checkbox from '../shared/Checkbox.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { submitQuestionSet } from './thunks';

class QuestionSetFormDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	verifyQuestionSet() {
		const set = this.props.questionSet;
		if (!set.title) {
			this.titleInput.error('Need a set title.');
			return false;
		}
		this.titleInput.clearError();
		return true;
	}
	submitQuestionSet() {
		if (this.verifyQuestionSet()) {
			const set = this.props.questionSet;
			this.props.dispatch(submitQuestionSet(set, this.props.mode));
		}
	}
	render() {
		return (
			<form onSubmit={(e) => { e.preventDefault(); this.submitQuestionSet(); }}>
				<TextInput
					label="Title" placeholder="My Question Set" required
					value={this.props.questionSet.title}
					ref={(t) => { this.titleInput = t; }}
					onChange={() => { this.props.editSetTitle(this.titleInput.node.value); }}
				/>
			<QuestionInputGroup questions={this.props.questionSet.questions} mode={this.props.mode} />
				<Checkbox
					label="Private set" ref={(c) => { this.checkboxInput = c; }}
					checked={this.props.questionSet.privacy}
					onChange={() => { this.props.toggleSetPrivacy(this.checkboxInput.node.checked); }}
				/>
			<input type="submit" className="button button-primary" name="Submit" />
			</form>
		);
	}
}

QuestionSetFormDisplay.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
	questionSet: PropTypes.shape(questionSetPropTypes).isRequired,
	mode: PropTypes.oneOf(['edit', 'create']).isRequired,
};

const QuestionSetForm = connect()(QuestionSetFormDisplay);

export default QuestionSetForm;
