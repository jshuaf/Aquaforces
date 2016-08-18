import React from 'react';

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
			console.log(body);
		});
	}
	render() {
		return <button onClick={this.getQuestionSets}>Click me</button>;
	}
}

export default QuestionSetList;
