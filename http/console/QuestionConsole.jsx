import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Header, UnderHeader } from '../shared/Header.jsx';
import QuestionConsoleHeader from './QuestionConsoleHeader.jsx';
import { authenticateUser } from './thunks';

class QuestionConsoleDisplay extends Component {
	componentDidMount() {
		this.props.authenticateUser();
	}
	render() {
		return (
			<div id="questionConsole">
				<Header currentUser={this.props.currentUser} />
				<UnderHeader style={{ marginBottom: '1%' }} />
				<div className="container">
					<QuestionConsoleHeader />
					{this.props.children}
				</div>
			</div>
		);
	}
}

QuestionConsoleDisplay.propTypes = {
	children: PropTypes.any.isRequired,
	authenticateUser: PropTypes.func.isRequired,
	currentUser: PropTypes.any,
};

const mapStateToProps = (state) => ({
	currentUser: state.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
	authenticateUser: () => {
		dispatch(authenticateUser());
	},
});

const QuestionConsole = connect(mapStateToProps, mapDispatchToProps)(QuestionConsoleDisplay);

export default QuestionConsole;
