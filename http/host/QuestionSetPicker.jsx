import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { questionSetPropTypes } from '../console/QuestionSet.jsx';
import { populateQuestionSetList, updateSelectedSet } from './actions';

/* global sweetAlert:true */

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
		}, (error, res, body) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
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
				<h1>Pick a question set</h1>
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
	questionSets: PropTypes.arrayOf(PropTypes.shape(questionSetPropTypes)).isRequired,
};

const mapStateToProps = (state) => ({
	questionSets: state.boarding.questionSets,
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
