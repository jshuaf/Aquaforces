import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { importQuestionSet } from './thunks';
import colors from '../shared/colors';

class QuestionSetSummaryDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	importQuestionSet() {
		this.props.importQuestionSet(this.props.source);
	}
	render() {
		let questionSetNote;
		if (this.props.privacy === false) {
			questionSetNote = '(Public)';
		} else if (this.props.privacy) {
			questionSetNote = '(Private)';
		} else if (this.props.source) {
			questionSetNote = `(${this.props.source.name.capitalize()})`;
		}

		const textStyle = {
			color: 'white',
		};
		const containerStyle = {
			padding: '20px',
			borderRadius: '20px',
			marginBottom: '20px',
			backgroundColor: colors.pacific,
		};
		const importedSetButtons = [
			<Link to={`/set/${this.props.shortID}`} key={0}>
			<button className="button button-secondary">
				View Set
			</button>
		</Link>,
			<Link to={`/set/${this.props.shortID}/edit`} key={1}>
			<button className="button button-secondary">
				Edit Set
			</button>
		</Link>,
		];
		const notImportedSetButtons = [
			<button className="button button-secondary" onClick={this.importQuestionSet}>
				Import Set
			</button>,
		];
		return (
				<div style={containerStyle} className="eight columns">
					<div className="row">
						<div className="eight columns">
							<h2 key={-1} className="marginless" style={textStyle}>{this.props.title}</h2>
							<h4 style={textStyle}>
								{this.props.questions.length === 1 ?
								`1 question ${questionSetNote}` :
								`${this.props.questions.length}
									questions ${questionSetNote}`
								}
							</h4>
						</div>
						<div className="four columns text-right">
							{this.props._id ? importedSetButtons : notImportedSetButtons}
						</div>
					</div>
				</div>
		);
	}
}

QuestionSetSummaryDisplay.propTypes = Object.assign({
	importQuestionSet: PropTypes.func.isRequired,
}, questionSetPropTypes);

const mapDispatchToProps = (dispatch) => ({
	importQuestionSet: (source) => {
		dispatch(importQuestionSet(source));
	},
});

const QuestionSetSummary = connect(null, mapDispatchToProps)(QuestionSetSummaryDisplay);

export default QuestionSetSummary;
