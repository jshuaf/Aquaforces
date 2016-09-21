import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { ActionCreators as changes } from 'redux-undo';
import EditQuestion from './EditQuestion.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import Checkbox from '../shared/Checkbox.jsx';
import { addQuestionInput, editSetTitle, toggleSetPrivacy } from './actions';
import { submitQuestionSet } from './thunks';

class CreateQuestionSetDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
		this.state = {
			mode: props.route.path.indexOf('/edit') >= 0 ? 'edit' : 'create',
		};
	}
	componentWillReceiveProps(props) {
		this.setState({ mode: props.route.path.indexOf('/edit') >= 0 ? 'edit' : 'create' });
	}
	saveChanges() {
		return this.props.submitQuestionSet(this.props.set, this.state.mode);
	}
	addQuestion() {
		this.props.addQuestionInput(this.state.mode);
	}
	render() {
		const questionGroups = [[]];
		this.props.set.questions.forEach((question) => {
			if (questionGroups[questionGroups.length - 1].length < 2) {
				questionGroups[questionGroups.length - 1].push(
					<EditQuestion
							{...question} key={questionGroups[questionGroups.length - 1]} mode={this.state.mode} />
				);
			} else {
				questionGroups.push([
					<EditQuestion
						{...question} key={questionGroups[questionGroups.length - 1]} mode={this.state.mode} />,
				]);
			}
		});
		return (
			<div className="questionSet">
					<div className="row">
						<TextInput
							value={this.props.set.title}
							ref={(t) => { this.titleInput = t; }}
							onChange={() => { this.props.editSetTitle(this.titleInput.node.value, this.state.mode); }}
							placeholder="Set Title"
						/>
						<PrimaryButton onClick={this.addQuestion}>Add Question</PrimaryButton>
						<PrimaryButton onClick={this.saveChanges}>Submit Set</PrimaryButton>
						<PrimaryButton onClick={this.props.undoLastChange}>Undo</PrimaryButton>
						<PrimaryButton onClick={this.props.redoLastChange}>Redo</PrimaryButton>
						<Checkbox
							label="Private Set" checked={this.props.set.privacy}
							onChange={(value) => { this.props.toggleSetPrivacy(value, this.state.mode); }}
						/>
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
	undoLastChange: PropTypes.func.isRequired,
	redoLastChange: PropTypes.func.isRequired,
	addQuestionInput: PropTypes.func.isRequired,
	submitQuestionSet: PropTypes.func.isRequired,
	editSetTitle: PropTypes.func.isRequired,
	toggleSetPrivacy: PropTypes.func.isRequired,
	route: PropTypes.any,
};

const mapStateToProps = (state) => ({ set: state.newQuestionSet.present });

const mapDispatchToProps = {
	submitQuestionSet,
	addQuestionInput,
	editSetTitle,
	undoLastChange: changes.undo,
	redoLastChange: changes.redo,
	toggleSetPrivacy,
};

const CreateQuestionSet = connect(mapStateToProps, mapDispatchToProps)(CreateQuestionSetDisplay);

export default CreateQuestionSet;
