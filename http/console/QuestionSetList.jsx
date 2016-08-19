import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { populateQuestionSetList } from './actions';

const request = require('request');

class QuestionSetList extends React.Component {
	constructor(props) {
		super(props);
		this.getQuestionSets = this.getQuestionSets.bind(this);
	}
	getQuestionSets() {
		const url = `${location.protocol}//${location.host}/api/get-qsets`;
		request({
			url,
			body: {},
			json: true,
			method: 'post',
		}, (error, response, body) => {
			if (error) return console.error(error);
			this.props.dispatch(populateQuestionSetList(body));
		});
	}
	render() {
		return <button onClick={this.getQuestionSets}>Click me</button>;
	}
}

QuestionSetList.propTypes = {
	dispatch: PropTypes.func,
};

/* eslint-disable no-class-assign */
QuestionSetList = connect()(QuestionSetList);
/* eslint-enable no-class-assign */

export default QuestionSetList;
