import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { ActionCreators as changes } from 'redux-undo';
import EditQuestion from './EditQuestion.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import TextInput from '../shared/TextInput.jsx';
import Checkbox from '../shared/Checkbox.jsx';
import { addQuestionInput, editSetTitle, toggleSetPrivacy } from './actions';
import { deleteQuestionSet, getQuestionSet, submitQuestionSet } from './thunks';

class EditQuestionSetDisplay extends Component {
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
	deleteQuestionSet() {
		this.props.deleteQuestionSet(this.props.set._id);
	}
	discardChanges() {
		this.props.getQuestionSet(this.props.set.shortID);
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
						{...question} key={questionGroups[questionGroups.length - 1]}
						mode={this.state.mode} />
				);
			} else {
				questionGroups.push([
					<EditQuestion
						{...question} key={questionGroups[questionGroups.length - 1]}
						mode={this.state.mode} />,
				]);
			}
		});

		const buttonStyle = {	margin: '0 1%' };
		const imageButtonStyle = Object.assign({}, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '45px',
			width: '45px',
			padding: 0,
			minWidth: 0,
		}, buttonStyle);
		const buttonContainerStyle = {
			display: 'flex',
			alignItems: 'center',
		};
		return (
			<div className="questionSet">
					<div className="row">
						<TextInput
							value={this.props.set.title}
							ref={(t) => { this.titleInput = t; }}
							onChange={() => { this.props.editSetTitle(this.titleInput.node.value, this.state.mode); }}
						/>
						<div style={buttonContainerStyle}>
							<PrimaryButton onClick={this.saveChanges} style={buttonStyle}>Save changes </PrimaryButton>
							<Link to={`/set/${this.props.set.shortID}`}>
								<PrimaryButton onClick={this.discardChanges} style={buttonStyle}>
									Discard changes
								</PrimaryButton>
							</Link>
							<PrimaryButton onClick={this.addQuestion} style={imageButtonStyle}>
								<img src="/img/icons/plus.svg" alt="Add Question" />
							</PrimaryButton>
							<PrimaryButton onClick={this.props.undoLastChange} style={imageButtonStyle}>
								<img src="/img/icons/undo.svg" alt="Undo" />
							</PrimaryButton>
							<PrimaryButton onClick={this.props.redoLastChange} style={imageButtonStyle}>
								<img src="/img/icons/redo.svg" alt="Redo" />
							</PrimaryButton>
						</div>
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

EditQuestionSetDisplay.propTypes = {
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
	toggleSetPrivacy: PropTypes.func.isRequired,
	route: PropTypes.any,
};

const mapStateToProps = (state) => ({ set: state.activeQuestionSet.present });

const mapDispatchToProps = {
	deleteQuestionSet,
	getQuestionSet,
	submitQuestionSet,
	addQuestionInput,
	editSetTitle,
	undoLastChange: changes.undo,
	redoLastChange: changes.redo,
	toggleSetPrivacy,
};

const EditQuestionSet = connect(mapStateToProps, mapDispatchToProps)(EditQuestionSetDisplay);

export default EditQuestionSet;
