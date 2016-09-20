import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import QuestionView from './QuestionView.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import { deleteQuestionSet, getQuestionSet } from './thunks';
import colors from '../shared/colors';

class QuestionSetViewDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	deleteQuestionSet() {
		this.props.deleteQuestionSet(this.props._id);
	}
	discardChanges() {
		this.props.getQuestionSet(this.props.shortID);
	}
	render() {
		const questionGroups = [[]];
		this.props.questions.forEach((question) => {
			if (questionGroups[questionGroups.length - 1].length < 2) {
				questionGroups[questionGroups.length - 1].push(
					<QuestionView {...question} key={questionGroups[questionGroups.length - 1]} />
				);
			} else {
				questionGroups.push([
					<QuestionView {...question} key={questionGroups[questionGroups.length - 1]} />,
				]);
			}
		});
		const headerStyle = { color: colors.midnight };
		return (
			<div className="questionSet">
				<div className="row">
					<h2 style={headerStyle}>{this.props.title}</h2>
					{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
					<PrimaryButton onClick={this.deleteQuestionSet}>Delete set </PrimaryButton>
					<Link to={`/set/${this.props.shortID}/edit`}>
						<PrimaryButton>Edit set </PrimaryButton>
					</Link>
				</div>
				{questionGroups.map((questionGroup, index) =>
					<div className="row" key={index}>
						{questionGroup}
					</div>
				)}
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

QuestionSetViewDisplay.propTypes = Object.assign({
	deleteQuestionSet: PropTypes.func.isRequired,
	getQuestionSet: PropTypes.func.isRequired,
	_id: PropTypes.string.isRequired,
	shortID: PropTypes.string.isRequired,
}, questionSetPropTypes);

const mapStateToProps = (state) => state.activeQuestionSet.present;

const mapDispatchToProps = {
	deleteQuestionSet,
	getQuestionSet,
};

const QuestionSetView = connect(mapStateToProps, mapDispatchToProps)(QuestionSetViewDisplay);

export default QuestionSetView;
