import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { ActionCreators as changes } from 'redux-undo';
import Question from './Question.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import { addQuestionInput, editSetTitle } from './actions';
import { deleteQuestionSet, getQuestionSet, submitQuestionSet } from './thunks';
import colors from '../shared/colors';

class QuestionSetDisplay extends Component {
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
	saveChanges() {
		const {
			/* eslint-disable no-unused-vars */
			deleteQuestionSet, getQuestionSet, location, params, history,
			route, routeParams, routes, children, ...props }
			/* eslint-enable no-unused-vars */
		= this.props;
		return this.props.submitQuestionSet(props, 'edit');
	}
	addQuestion() {
		this.props.addQuestionInput('edit');
	}
	render() {
		const questionGroups = [[]];
		this.props.questions.forEach((question) => {
			if (questionGroups[questionGroups.length - 1].length < 2) {
				questionGroups[questionGroups.length - 1].push(
					<Question
						{...question} key={questionGroups[questionGroups.length - 1]}
						route={this.props.route}
					/>
				);
			} else {
				questionGroups.push([
					<Question
						{...question} key={questionGroups[questionGroups.length - 1]}
						route={this.props.route}
					/>,
				]);
			}
		});
		const headerStyle = { color: colors.midnight };
		return (
			<div className="questionSet">
					{
						window.location.href.indexOf('/edit') < 0 ?
						<div className="row">
							<h2 style={headerStyle}>{this.props.title}</h2>
							{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
							<PrimaryButton onClick={this.deleteQuestionSet}>Delete set </PrimaryButton>
							<Link to={`/set/${this.props.shortID}/edit`}>
								<PrimaryButton onClick={this.editQuestionSet}>Edit set </PrimaryButton>
							</Link>
						</div> :
						<div className="row">
							<TextInput
								value={this.props.title}
								ref={(t) => { this.titleInput = t; }}
								onChange={() => { this.props.editSetTitle(this.titleInput.node.value, 'edit'); }}
							/>
							<PrimaryButton onClick={this.addQuestion}>Add Question</PrimaryButton>
							<Link to={`/set/${this.props.shortID}`}>
								<PrimaryButton onClick={this.discardChanges}>Discard changes </PrimaryButton>
							</Link>
							<PrimaryButton onClick={this.saveChanges}>Save changes </PrimaryButton>
							<PrimaryButton onClick={this.props.undoLastChange}>Undo</PrimaryButton>
							<PrimaryButton onClick={this.props.redoLastChange}>Redo</PrimaryButton>
						</div>
					}
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

QuestionSetDisplay.propTypes = Object.assign({
	deleteQuestionSet: PropTypes.func.isRequired,
	getQuestionSet: PropTypes.func.isRequired,
	undoLastChange: PropTypes.func.isRequired,
	redoLastChange: PropTypes.func.isRequired,
	_id: PropTypes.string.isRequired,
	shortID: PropTypes.string.isRequired,
}, questionSetPropTypes);

const mapStateToProps = (state) => state.activeQuestionSet.present;

const mapDispatchToProps = {
	deleteQuestionSet,
	getQuestionSet,
	submitQuestionSet,
	addQuestionInput,
	editSetTitle,
	undoLastChange: changes.undo,
	redoLastChange: changes.redo,
};

const QuestionSet = connect(mapStateToProps, mapDispatchToProps)(QuestionSetDisplay);

export default QuestionSet;
