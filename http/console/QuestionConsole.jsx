import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Header, UnderHeader } from '../shared/Header.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import { authenticateUser } from './actions';

const request = require('request');

/* global sweetAlert:true */

class QuestionConsoleDisplay extends Component {
	componentDidMount() {
		const url = `${location.protocol}//${location.host}/api/authenticate`;
		request({ url, json: true, method: 'post' }, (error, res, body) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			this.props.authenticateUser(body);
		});
	}
	render() {
		return (
			<div id="questionConsole">
				<Header currentUser={this.props.currentUser} />
				<UnderHeader />
				<div className="container inline-blocky">
						<h1>Question Console</h1>
						<Link to="/console/new"><PrimaryButton>New Set</PrimaryButton></Link>
						<Link to="/console/"><PrimaryButton>View Sets</PrimaryButton></Link>
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
	authenticateUser: (user) => {
		dispatch(authenticateUser(user));
	},
});

const QuestionConsole = connect(mapStateToProps, mapDispatchToProps)(QuestionConsoleDisplay);

export default QuestionConsole;
