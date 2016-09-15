import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import SearchBar from './SearchBar.jsx';
import PrimaryButton from '../shared/PrimaryButton.jsx';
import { getQuestionSets } from './thunks';

class QuestionConsoleHeaderDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	viewMySets() {
		this.props.dispatch(getQuestionSets());
	}
	render() {
		const containerStyle = {
			marginBottom: '2%',
		};
		const linkStyle = {
			padding: '0 2% 0 2%',
		};
		const buttonStyle = {
			fontSize: '1.1em',
			height: '30px',
			lineHeight: 'normal',
			minWidth: '100px',
			padding: 0,
		};
		return (
			<div className="row text-center" style={containerStyle}>
				<div className="nine columns">
					<SearchBar initialQuery={this.props.initialQuery} />
				</div>
				<div style={containerStyle} className="three columns">
					<Link to="/console/new" style={linkStyle}>
						<PrimaryButton style={buttonStyle}>New Set</PrimaryButton>
					</Link>
					<a style={linkStyle} onClick={this.viewMySets}>
						<PrimaryButton style={buttonStyle}>My Sets</PrimaryButton>
					</a>
				</div>
			</div>
		);
	}
}

QuestionConsoleHeaderDisplay.propTypes = {
	initialQuery: PropTypes.string,
	dispatch: PropTypes.func.isRequired,
};

const QuestionConsoleHeader = connect()(QuestionConsoleHeaderDisplay);
export default QuestionConsoleHeader;
