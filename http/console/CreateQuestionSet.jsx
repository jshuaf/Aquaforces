import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { ActionCreators as changes } from 'redux-undo';
import EditQuestion from './EditQuestion.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import { addQuestionInput, editSetTitle } from './actions';
import { deleteQuestionSet, getQuestionSet, submitQuestionSet } from './thunks';

class CreateQuestionSetDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	componentWillReceiveProps(props) {
		this.mode = props.route.path.indexOf('/edit') >= 0 ? 'edit' : 'create';
	}
	deleteQuestionSet() {
		this.props.deleteQuestionSet(this.props.set._id);
	}
	discardChanges() {
		this.props.getQuestionSet(this.props.set.shortID);
	}
	saveChanges() {
		return this.props.submitQuestionSet(this.props.set, this.mode);
	}
	addQuestion() {
		this.props.addQuestionInput(this.mode);
	}
	render() {
		const questionGroups = [[]];
		this.props.set.questions.forEach((question) => {
			if (questionGroups[questionGroups.length - 1].length < 2) {
				questionGroups[questionGroups.length - 1].push(
					<EditQuestion {...question} key={questionGroups[questionGroups.length - 1]} />
				);
			} else {
				questionGroups.push([
					<EditQuestion {...question} key={questionGroups[questionGroups.length - 1]} />,
				]);
			}
		});
		return (
			<div className="questionSet">
					<div className="row">
						<TextInput
							value={this.props.set.title}
							ref={(t) => { this.titleInput = t; }}
							onChange={() => { this.props.editSetTitle(this.titleInput.node.value, this.mode); }}
						/>
						<PrimaryButton onClick={this.addQuestion}>Add Question</PrimaryButton>
						<Link to={`/set/${this.props.set.shortID}`}>
							<PrimaryButton onClick={this.discardChanges}>Discard changes </PrimaryButton>
						</Link>
						<PrimaryButton onClick={this.saveChanges}>Save changes </PrimaryButton>
						<PrimaryButton onClick={this.props.undoLastChange}>Undo</PrimaryButton>
						<PrimaryButton onClick={this.props.redoLastChange}>Redo</PrimaryButton>
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

CreateQuestionSetDisplay.propTypes = {
	set: PropTypes.shape(Object.assign({
		_id: PropTypes.string.isRequired,
		shortID: PropTypes.string.isRequired,
	}, questionSetPropTypes)),
	deleteQuestionSet: PropTypes.func.isRequired,
	getQuestionSet: PropTypes.func.isRequired,
	undoLastChange: PropTypes.func.isRequired,
	redoLastChange: PropTypes.func.isRequired,
	addQuestionInput: PropTypes.func.isRequired,
	submitQuestionSet: PropTypes.func.isRequired,
	editSetTitle: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ set: state.newQuestionSet.present });

const mapDispatchToProps = {
	deleteQuestionSet,
	getQuestionSet,
	submitQuestionSet,
	addQuestionInput,
	editSetTitle,
	undoLastChange: changes.undo,
	redoLastChange: changes.redo,
};

const CreateQuestionSet = connect(mapStateToProps, mapDispatchToProps)(CreateQuestionSetDisplay);

export default CreateQuestionSet;
