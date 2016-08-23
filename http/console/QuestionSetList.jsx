import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { populateQuestionSetList } from './actions';
import QuestionSet from './QuestionSet.jsx';

const request = require('request');

class QuestionSetList extends Component {
	componentDidMount() {
		const url = `${location.protocol}//${location.host}/api/get-qsets`;
		request({
			url,
			body: {},
			json: true,
			method: 'post',
		}, (error, response, body) => {
			if (error) return console.error(error);
			this.props.populateQuestionSetList(body);
		});
	}
	render() {
		return (
			<div id="questionSets">
				<h1>Question Sets</h1>
			{
				this.props.questionSets.map((questionSet, index) =>
					<QuestionSet {...questionSet} key={index} />
				)
			}
		</div>
		);
	}
}

const mapStateToProps = (state) => ({
	questionSets: state.questionSets,
});

const mapDispatchToProps = (dispatch) => ({
	populateQuestionSetList: (questionSets) => {
		dispatch(populateQuestionSetList(questionSets));
	},
});

QuestionSetList.propTypes = {
	populateQuestionSetList: PropTypes.func.isRequired,
	questionSets: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string.isRequired,
		nextQuestionID: PropTypes.number.isRequired,
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
	})).isRequired,
};

/* eslint-disable no-class-assign */
QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetList);
/* eslint-enable no-class-assign */

export default QuestionSetList;
