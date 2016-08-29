import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Question from './Question.jsx';
import { deleteSet, populateActiveQuestionSet } from './actions';

/* global sweetAlert:true */

const request = require('request');

class QuestionSet extends Component {
	constructor(props) {
		super(props);
		this.deleteSet = this.deleteSet.bind(this);
	}
	componentDidMount() {
		const url = `${location.protocol}//${location.host}/api/get-qset`;
		request({
			url,
			body: { shortID: this.props.params.shortID },
			json: true,
			method: 'post',
		}, (error, res, body) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) {
				return sweetAlert({ title: res.body, type: 'error' }, () => { location.href = '/console'; });
			}
			this.props.populateActiveQuestionSet(body);
		});
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
			<div className="questionSet">
				<h3>Question Set</h3>
				<h4 key={-1}>{this.props.title}</h4>
				{this.props.questions.map((question, index) =>
					<Question {...question} key={index} />
				)}
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

QuestionSet.propTypes = Object.assign({
	deleteSet: PropTypes.func.isRequired,
	_id: PropTypes.string.isRequired,
	shortID: PropTypes.string.isRequired,
}, questionSetPropTypes);

const mapStateToProps = (state) => state.activeQuestionSet;

const mapDispatchToProps = (dispatch) => ({
	deleteSet: (id) => {
		dispatch(deleteSet(id));
	},
	populateActiveQuestionSet: (set) => {
		dispatch(populateActiveQuestionSet(set));
	},
});

/* eslint-disable no-class-assign */
QuestionSet = connect(mapStateToProps, mapDispatchToProps)(QuestionSet)
/* eslint-enable no-class-assign */;

export default QuestionSet;
