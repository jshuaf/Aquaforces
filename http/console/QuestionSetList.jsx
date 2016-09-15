import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetSummary from './QuestionSetSummary.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import Spinner from '../shared/Spinner.jsx';
import { getQuestionSets } from './thunks';

class QuestionSetListDisplay extends Component {
	componentDidMount() {
		this.props.getQuestionSets();
	}
	render() {
		const requestCategories = Object.keys(this.props.requests);
		for (let i = 0; i < requestCategories.length; i++) {
			const requestCategory = requestCategories[i];
			if (this.props.requests[requestCategory].length > 0 && requestCategory !== 'create') {
				return <Spinner />;
			}
		}

		const summaries = [[]];
		let lastDelay = 200;
		this.props.questionSets.forEach((questionSet, index) => {
			if (index !== 0) lastDelay += (100 / Math.pow(index, 0.3));
			else lastDelay += 100;
			if (summaries[summaries.length - 1].length < 2) {
				summaries[summaries.length - 1].push(
					<QuestionSetSummary
						{...questionSet} key={summaries[summaries.length - 1].length} delay={lastDelay} />
				);
			} else {
				summaries.push([
					<QuestionSetSummary
						{...questionSet} key={summaries[summaries.length - 1].length} delay={lastDelay} />,
				]);
			}
		});

		return (
			<div id="questionSets">
				{
					summaries.map((questionSets, index) =>
						<div className="row" key={index}>
							{questionSets}
						</div>
					)
				}
		</div>
		);
	}
}

QuestionSetListDisplay.propTypes = {
	getQuestionSets: PropTypes.func.isRequired,
	questionSets: PropTypes.arrayOf(
		PropTypes.shape(questionSetPropTypes)).isRequired,
	requests: PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	questionSets: state.questionSets,
	requests: state.requests,
});

const mapDispatchToProps = (dispatch) => ({
	getQuestionSets: () => {
		dispatch(getQuestionSets());
	},
});

const QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetListDisplay);

export default QuestionSetList;
