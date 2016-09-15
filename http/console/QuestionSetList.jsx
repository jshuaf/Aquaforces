import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetSummary from './QuestionSetSummary.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { getQuestionSets } from './thunks';

class QuestionSetListDisplay extends Component {
	render() {
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
	questionSets: PropTypes.arrayOf(
		PropTypes.shape(questionSetPropTypes)).isRequired,
};

const mapStateToProps = (state) => ({
	questionSets: state.questionSets,
});

const QuestionSetList = connect(mapStateToProps)(QuestionSetListDisplay);

export default QuestionSetList;
