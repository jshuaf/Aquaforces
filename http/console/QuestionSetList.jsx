import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
<<<<<<< HEAD
import { Link } from 'react-router';
import { questionSetPropTypes } from './QuestionSet.jsx';
import SearchBar from './SearchBar.jsx';
import Spinner from '../shared/Spinner.jsx';
import { getQuestionSets } from './thunks';
=======
import QuestionSetSummary, { questionSetSummaryPropTypes } from './QuestionSetSummary.jsx';
import { populateQuestionSetList } from './actions';
>>>>>>> master

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
<<<<<<< HEAD
				<h3>Question Sets</h3>
				<SearchBar />
				{
					this.props.questionSets.map((questionSet, index) =>
						<Link to={`/set/${questionSet.shortID}`} key={index}>
							<button>{questionSet.title}</button>
						</Link>
					)
				}
=======
			{
				this.props.questionSets.map((questionSet, index) =>
					<div className="row">
						<QuestionSetSummary {...questionSet} key={index} />
					</div>
				)
			}
>>>>>>> master
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

<<<<<<< HEAD
const QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetListDisplay);
=======
QuestionSetList.propTypes = {
	populateQuestionSetList: PropTypes.func.isRequired,
	questionSets: PropTypes.arrayOf(
		PropTypes.shape(questionSetSummaryPropTypes)).isRequired,
};

/* eslint-disable no-class-assign */
QuestionSetList = connect(mapStateToProps, mapDispatchToProps)(QuestionSetList);
/* eslint-enable no-class-assign */
>>>>>>> master

export default QuestionSetList;
