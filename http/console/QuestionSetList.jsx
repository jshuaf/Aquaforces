import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import QuestionSetSummary from './QuestionSetSummary.jsx';
import { questionSetPropTypes } from './QuestionSet.jsx';
import SearchBar from './SearchBar.jsx';
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
			if (this.props.requests[requestCategory].length > 0 && requestCategory !== 'new') {
				return <Spinner />;
			}
		}
		return (
			<div id="questionSets">
				<h3>Question Sets</h3>
				<SearchBar />
			{
				this.props.questionSets.map((questionSet, index) =>
					<div className="row">
						<QuestionSetSummary {...questionSet} key={index} />
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
