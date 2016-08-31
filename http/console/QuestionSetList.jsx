import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { questionSetPropTypes } from './QuestionSet.jsx';
import SearchBar from './SearchBar.jsx';
import { populateQuestionSetList } from './actions';

/* global sweetAlert:true */

const request = require('request');

class QuestionSetList extends Component {
	componentDidMount() {
		const url = `${location.protocol}//${location.host}/api/get-qsets`;
		request({
			url,
			body: {},
			json: true,
			method: 'post',
		}, (error, res, body) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			this.props.populateQuestionSetList(body);
		});
	}
	render() {
		return (
			<div id="questionSets">
				<h3>Question Sets</h3>
				<SearchBar />
				{
					this.props.questionSets.map((questionSet, index) =>
						<Link to={`/set/${questionSet.shortID}`} key={index}>
							<button>{questionSet.title}</button>
						</Link>
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
	questionSets: PropTypes.arrayOf(
		PropTypes.shape(questionSetPropTypes)).isRequired,
};

/* eslint-disable no-class-assign */
QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetList);
/* eslint-enable no-class-assign */

export default QuestionSetList;
