import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Question from './Question.jsx';
import { deleteQuestionSet, getQuestionSet } from './thunks';

class QuestionSet extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	deleteQuestionSet() {
		this.props.deleteQuestionSet(this.props._id);
	}
	render() {
		const questionGroups = [[]];
		this.props.questions.forEach((question) => {
			if (questionGroups[questionGroups.length - 1].length < 2) {
				questionGroups[questionGroups.length - 1].push(
					<Question {...question} key={questionGroups[questionGroups.length - 1]} />
				);
			} else {
				questionGroups.push([
					<Question {...question} key={questionGroups[questionGroups.length - 1]} />,
				]);
			}
		});
		return (
			<div className="questionSet">
				<h2>{this.props.title}</h2>
				{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
				{questionGroups.map((questionGroup, index) =>
					<div className="row" key={index}>
						{questionGroup}
					</div>
				)}
				<button onClick={this.deleteQuestionSet}>Delete set </button>
				<Link to={`/set/${this.props.params.shortID}/edit`}>
					<button onClick={this.editQuestionSet}>Edit set </button>
				</Link>
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
	privacy: PropTypes.bool,
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
