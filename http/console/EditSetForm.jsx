import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetForm from './QuestionSetForm.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { editSetTitle, toggleSetPrivacy } from './actions';
import { getQuestionSet } from './thunks';

/* eslint-disable react/prefer-stateless-function */
class EditSetFormDisplay extends Component {
/* eslint-enable react/prefer-stateless-function */
	render() {
		const { activeQuestionSet, ...props } = this.props;
		return (
			<div>
				<h3>Edit Question Set</h3>
				<QuestionSetForm questionSet={activeQuestionSet} {...props} mode="edit" />
			</div>
		);
	}
}

EditSetFormDisplay.propTypes = {
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	getQuestionSet: PropTypes.func.isRequired,
	activeQuestionSet: PropTypes.shape(questionSetPropTypes).isRequired,
	params: PropTypes.any,
};

const mapStateToProps = (state) => ({
	activeQuestionSet: state.activeQuestionSet,
});

const mapDispatchToProps = (dispatch) => ({
	editSetTitle: (text) => {
		dispatch(editSetTitle(text, 'edit'));
	},
	toggleSetPrivacy: (privacy) => {
		dispatch(toggleSetPrivacy(privacy, 'edit'));
	},
	getQuestionSet: (shortID) => {
		dispatch(getQuestionSet(shortID));
	},
});

const EditSetForm = connect(mapStateToProps, mapDispatchToProps)(EditSetFormDisplay);

export default EditSetForm;
