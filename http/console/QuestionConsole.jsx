import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Header, UnderHeader } from '../shared/Header.jsx';
import QuestionConsoleHeader from './QuestionConsoleHeader.jsx';
import Spinner from '../shared/Spinner.jsx';
import { authenticateUser, getQuestionSets, searchQuestionSets, getQuestionSet } from './thunks';

class QuestionConsoleDisplay extends Component {
	componentDidMount() {
		this.props.authenticateUser();
		this.props.getQuestionSets();
		if (this.props.params.query) {
			this.props.searchQuestionSets(this.props.params.query);
		} else if (this.props.params.shortID) {
			this.props.getQuestionSet(this.props.params.shortID);
		}
	}
	render() {
		let spinner = false;
		const requestCategories = Object.keys(this.props.requests);
		for (let i = 0; i < requestCategories.length; i++) {
			const requestCategory = requestCategories[i];
			if (this.props.requests[requestCategory].length > 0) {
				spinner = true;
			}
		}
		return (
			<div id="questionConsole">
				<Header currentUser={this.props.currentUser} location="console" />
				<UnderHeader style={{ marginBottom: '1%' }} />
				<div className="container">
					<QuestionConsoleHeader initialQuery={this.props.params.query} />
					{spinner ? <Spinner /> : this.props.children}
				</div>
			</div>
		);
	}
}

QuestionConsoleDisplay.propTypes = {
	children: PropTypes.any.isRequired,
	authenticateUser: PropTypes.func.isRequired,
	currentUser: PropTypes.any,
	requests: PropTypes.objectOf(PropTypes.any).isRequired,
	getQuestionSets: PropTypes.func.isRequired,
	getQuestionSet: PropTypes.func.isRequired,
	searchQuestionSets: PropTypes.func.isRequired,
	params: PropTypes.shape({ query: PropTypes.string }),
};

const mapStateToProps = (state) => ({
	currentUser: state.currentUser,
	requests: state.requests,
});

const mapDispatchToProps = (dispatch) => ({
	authenticateUser: () => { dispatch(authenticateUser()); },
	getQuestionSets: () => { dispatch(getQuestionSets()); },
	searchQuestionSets: (query) => { dispatch(searchQuestionSets(query)); },
	getQuestionSet: (shortID) => { dispatch(getQuestionSet(shortID)); },
});

const QuestionConsole = connect(mapStateToProps, mapDispatchToProps)(QuestionConsoleDisplay);

export default QuestionConsole;
