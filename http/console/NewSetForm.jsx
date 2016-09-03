import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetForm from './QuestionSetForm.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { editSetTitle, toggleSetPrivacy } from './actions';

/* eslint-disable react/prefer-stateless-function */
class NewSetFormDisplay extends Component {
/* eslint-enable react/prefer-stateless-function */
	render() {
		const { newQuestionSet, ...props } = this.props;
		return (
			<div>
				<h3>New Question Set</h3>
				<QuestionSetForm questionSet={newQuestionSet} {...props} mode="new" />
			</div>
		);
	}
}

NewSetFormDisplay.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	newQuestionSet: PropTypes.shape(questionSetPropTypes).isRequired,
};

const mapStateToProps = (state) => ({
	newQuestionSet: state.newQuestionSet,
});

const mapDispatchToProps = (dispatch) => ({
	editSetTitle: (text) => {
		dispatch(editSetTitle(text, 'new'));
	},
	toggleSetPrivacy: (privacy) => {
		dispatch(toggleSetPrivacy(privacy, 'new'));
	},
});

const NewSetForm = connect(mapStateToProps, mapDispatchToProps)(NewSetFormDisplay);

export default NewSetForm;
