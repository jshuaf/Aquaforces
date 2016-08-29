import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Question from './Question.jsx';
import { deleteSet } from './actions';

/* global sweetAlert:true */

const request = require('request');

class QuestionSetSummary extends Component {
	constructor(props) {
		super(props);
		this.deleteSet = this.deleteSet.bind(this);
	}
	deleteSet() {
		const url = `${location.protocol}//${location.host}/api/delete-qset`;
		request({
			url,
			method: 'post',
			json: true,
			body: { id: this.props._id },
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			this.props.deleteSet(this.props._id);
		});
	}
	render() {
		return (
			<div className="six columns">
				<div className="questionSetSummary">
					<h1 key={-1} className="marginless">{this.props.title}</h1>
					<h4>
						{this.props.questions.length} questions
						({this.props.privacy ? 'Private' : 'Public'})
					</h4>
					<button onClick={this.deleteSet} className="button button-secondary">Delete set</button>
				</div>
			</div>
		);
	}
}

export const questionSetPropTypes = {
	_id: PropTypes.string.isRequired,
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

QuestionSetSummary.propTypes = Object.assign({
	deleteSet: PropTypes.func.isRequired,
	_id: PropTypes.string.isRequired,
}, questionSetPropTypes);

const mapDispatchToProps = (dispatch) => ({
	deleteSet: (id) => {
		dispatch(deleteSet(id));
	},
});

/* eslint-disable no-class-assign */
QuestionSetSummary = connect(null, mapDispatchToProps)(QuestionSetSummary)
/* eslint-enable no-class-assign */;

export default QuestionSetSummary;
