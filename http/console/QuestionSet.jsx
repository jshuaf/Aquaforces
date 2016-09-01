import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import Question from './Question.jsx';
import { deleteQuestionSet, getQuestionSet } from './thunks';

class QuestionSet extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	componentDidMount() {
		this.props.getQuestionSet(this.props.params.shortID);
	}
	deleteQuestionSet() {
		this.props.deleteQuestionSet(this.props._id);
	}
	render() {
		return (
			<div className="questionSet">
				<h3>Question Set</h3>
				<h4 key={-1}>{this.props.title}</h4>
				{this.props.questions.map((question, index) =>
					<Question {...question} key={index} />
				)}
				{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
				<button onClick={this.deleteQuestionSet}>Delete set </button>
			</div>
		);
	}
}

export const questionSetPropTypes = {
	title: PropTypes.string.isRequired,
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
};

QuestionSet.propTypes = Object.assign({
	deleteQuestionSet: PropTypes.func.isRequired,
	_id: PropTypes.string.isRequired,
	shortID: PropTypes.string.isRequired,
}, questionSetPropTypes);

const mapStateToProps = (state) => state.activeQuestionSet;

const mapDispatchToProps = (dispatch) => ({
	deleteQuestionSet: (id) => {
		dispatch(deleteQuestionSet(id));
	},
	getQuestionSet: (shortID) => {
		dispatch(getQuestionSet(shortID));
	},
});

/* eslint-disable no-class-assign */
QuestionSet = connect(mapStateToProps, mapDispatchToProps)(QuestionSet)
/* eslint-enable no-class-assign */;

export default QuestionSet;
