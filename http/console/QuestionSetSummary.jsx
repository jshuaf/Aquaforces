import React, { Component, PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import autoBind from 'react-autobind';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { questionSetPropTypes } from './ViewQuestionSet.jsx';
import { importQuestionSet, getQuestionSet } from './thunks';
import colors from '../shared/colors';

class QuestionSetSummaryDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
		this.state = {
			additionalStyles: {},
		};
	}
	importQuestionSet() {
		/* eslint-disable no-unused-vars */
		const { delay, ...props } = this.props;
		/* eslint-enable no-unused-vars */
		this.props.importQuestionSet(props);
	}
	editQuestionSet() {
		this.props.getQuestionSet(this.props.shortID);
		browserHistory.push(`/set/${this.props.shortID}/edit`);
	}
	viewQuestionSet() {
		this.props.getQuestionSet(this.props.shortID);
		browserHistory.push(`/set/${this.props.shortID}`);
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
		const containerStyle = Object.assign({}, {
			padding: '20px',
			borderRadius: '20px',
			marginBottom: '20px',
			backgroundColor: colors.pacific,
		}, this.state.additionalStyles);

		const importedSetButtons = [
			<button className="button button-secondary" onClick={this.viewQuestionSet} key={0}>
				View Set
			</button>,
			<button className="button button-secondary" onClick={this.editQuestionSet} key={1}>
				Edit Set
			</button>,
		];
		const notImportedSetButtons = [
			<button className="button button-secondary" onClick={this.importQuestionSet} key={0}>
				Import Set
			</button>,
		];
		return (
			<ReactCSSTransitionGroup
				className="six columns"
				transitionName="pop-up" transitionAppear transitionAppearTimeout={this.props.delay}
				transitionEnterTimeout={0} transitionLeaveTimeout={0}
			>
				<div style={containerStyle}>
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
			</ReactCSSTransitionGroup>

		);
	}
}

QuestionSetSummaryDisplay.propTypes = Object.assign({
	importQuestionSet: PropTypes.func.isRequired,
	delay: PropTypes.number.isRequired,
}, questionSetPropTypes);

const mapDispatchToProps = (dispatch) => ({
	importQuestionSet: (source) => {
		dispatch(importQuestionSet(source));
	},
	getQuestionSet: (shortID) => {
		dispatch(getQuestionSet(shortID));
	},
});

const QuestionSetSummary = connect(null, mapDispatchToProps)(QuestionSetSummaryDisplay);

export default QuestionSetSummary;
