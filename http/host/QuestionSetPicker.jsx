import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { populateQuestionSetList, updateSelectedSet } from './actions';

const request = require('request');

class QuestionSetPickerDisplay extends Component {
	constructor(props) {
		super(props);
		this.updateSelectedSet = this.updateSelectedSet.bind(this);
		this.picker = null;
	}
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
			this.props.updateSelectedSet(this.props.questionSets[0]);
		});
	}
	updateSelectedSet() {
		this.props.updateSelectedSet(this.props.questionSets[this.picker.selectedIndex]);
	}
	render() {
		return (
			<div id="questionSetPicker">
				<h5>Pick a question set to use.</h5>
				<select ref={(s) => { this.picker = s; }} onChange={this.updateSelectedSet}>
					{
						this.props.questionSets.map((questionSet, index) =>
							<option key={index}>{questionSet.title}</option>
						)
					}
				</select>
			</div>
	);
	}
}

QuestionSetPickerDisplay.propTypes = {
	populateQuestionSetList: PropTypes.func.isRequired,
	updateSelectedSet: PropTypes.func.isRequired,
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

const mapStateToProps = (state) => ({
	questionSets: state.questionSets,
});

const mapDispatchToProps = (dispatch) => ({
	populateQuestionSetList: (questionSets) => {
		dispatch(populateQuestionSetList(questionSets));
	},
	updateSelectedSet: (questionSet) => {
		dispatch(updateSelectedSet(questionSet));
	},
});

/* eslint-disable no-class-assign */
const QuestionSetPicker = connect(mapStateToProps, mapDispatchToProps)(QuestionSetPickerDisplay);
/* eslint-enable no-class-assign */

export default QuestionSetPicker;
