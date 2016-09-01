import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { questionSetPropTypes } from './QuestionSet.jsx';
import SearchBar from './SearchBar.jsx';
import Spinner from '../shared/Spinner.jsx';
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
		if (this.props.searchRequests.length > 0) return <Spinner />;
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

QuestionSetList.propTypes = {
	populateQuestionSetList: PropTypes.func.isRequired,
	questionSets: PropTypes.arrayOf(
		PropTypes.shape(questionSetPropTypes)).isRequired,
	searchRequests: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	questionSets: state.questionSets,
	searchRequests: state.requests.search,
});

const mapDispatchToProps = (dispatch) => ({
	populateQuestionSetList: (questionSets) => {
		dispatch(populateQuestionSetList(questionSets));
	},
});

/* eslint-disable no-class-assign */
QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetList);
/* eslint-enable no-class-assign */

export default QuestionSetList;
