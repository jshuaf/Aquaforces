import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { questionSetPropTypes } from './QuestionSet.jsx';
import { deleteQuestionSet } from './thunks';
import colors from '../shared/colors';

class QuestionSetSummaryDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	render() {
		const textStyle = {
			color: 'white',
		};
		const containerStyle = {
			padding: '20px',
			borderRadius: '20px',
			marginBottom: '20px',
			backgroundColor: colors.pacific,
		};
		return (
				<div style={containerStyle} className="eight columns">
					<div className="row">
						<div className="eight columns">
							<h2 key={-1} className="marginless" style={textStyle}>{this.props.title}</h2>
							<h4 style={textStyle}>
								{this.props.questions.length === 1 ?
								`1 question (${this.props.privacy ? 'Private' : 'Public'})` :
								`${this.props.questions.length} questions (${this.props.privacy ? 'Private' : 'Public'})`
								}
							</h4>
						</div>
						<div className="four columns text-right">
							<Link to={`/set/${this.props.shortID}`}>
								<button className="button button-secondary">
									View Set
								</button>
							</Link>
							<Link to={`/set/${this.props.shortID}/edit`}>
								<button className="button button-secondary">
									Edit Set
								</button>
							</Link>
						</div>
					</div>
				</div>
		);
	}
}

QuestionSetSummaryDisplay.propTypes = Object.assign({
	deleteQuestionSet: PropTypes.func.isRequired,
}, questionSetPropTypes);

const mapDispatchToProps = (dispatch) => ({
	deleteQuestionSet: (id) => {
		dispatch(deleteQuestionSet(id));
	},
});

const QuestionSetSummary = connect(null, mapDispatchToProps)(QuestionSetSummaryDisplay);

export default QuestionSetSummary;
