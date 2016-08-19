import React, { PropTypes } from 'react';
import Question from './Question.jsx';

class QuestionSet extends React.Component {
	constructor(props) {
		super(props);
		this.deleteSet = this.deleteSet.bind(this);
	}
	deleteSet() {
		console.log('delete a set');
		return;
	}
	render() {
		return (
			<div className="questionSet">
				<h4 key={-1}>{this.props.title}</h4>
				{this.props.questions.map((question, index) =>
					<Question {...question} key={index} />
				)}
				{this.props.privacy ? <span key={-2}>Private set</span> : <span key={-2}>Public set</span>}
				<button key={-3} onClick={this.deleteSet}>Delete set</button>
			</div>
		);
	}
}

QuestionSet.propTypes = {
	title: PropTypes.string.isRequired,
	nextQuestionID: PropTypes.number.isRequired,
	questions: PropTypes.arrayOf(PropTypes.shape({
		text: PropTypes.string.isRequired,
		correctAnswer: PropTypes.string.isRequired,
		incorrectAnswers: PropTypes.arrayOf(PropTypes.shape({
			text: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
		})).isRequired,
		id: PropTypes.number.isRequired,
	})).isRequired,
	privacy: PropTypes.bool.isRequired,
};

export default QuestionSet;
