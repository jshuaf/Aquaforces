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
			<div className="questionSetSummary twelve columns">
				<h4 key={-1}>{this.props.title}</h4>
        <p>{this.props.questions.count} questions</p>
				{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
				<button onClick={this.deleteSet}>Delete set </button>
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
