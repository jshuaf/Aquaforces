import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Header, UnderHeader } from '../shared/Header.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import { authenticateUser } from './thunks';

class QuestionConsoleDisplay extends Component {
	componentDidMount() {
		this.props.authenticateUser();
	}
	render() {
		return (
			<div id="questionConsole">
				<Header currentUser={this.props.currentUser} />
				<UnderHeader />
					<h1>Question Console</h1>
					<Link to="/console/new"><PrimaryButton>New Set</PrimaryButton></Link>
					<Link to="/console/"><PrimaryButton>View Sets</PrimaryButton></Link>
				{this.props.children}
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
