import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Header, UnderHeader } from '../shared/Header.jsx';
import PrimaryInlineButton from '../shared/PrimaryInlineButton.jsx';
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
				<div className="container inline-blocky">
						<h1>Question Console</h1>
						<Link to="/console/new"><PrimaryInlineButton>New Set</PrimaryInlineButton></Link>
						<Link to="/console/"><PrimaryInlineButton>View Sets</PrimaryInlineButton></Link>
				</div>
				<div className="container">
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
