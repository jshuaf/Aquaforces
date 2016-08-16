import React, { PropTypes } from 'react';

/*
Question console layout:
newsetform
	textinput (title)
	questioninput (multiple)
		textinput (question)
		answerinput (answer)
	checkbox (private)

*/

const QuestionConsole = React.createClass({
	render() {
		return (
			<NewSetForm />
		);
	},
});

const NewSetForm = React.createClass({
	render() {
		return (
			<div id="new_set">
				<h2>New Question Set</h2>
				<TextInput label="Title" placeholder="My Question Set" />
				<QuestionInputGroup />
				<Checkbox label="Private set" />
			</div>
		);
	},
});

function TextInput({ placeholder, label }) {
	const containerStyle = {
		display: 'flex',
		flexDirection: 'column',
		height: '10%',
		width: '40%',
	};
	const labelStyle = {
		marginBottom: '2%',
		marginLeft: '1%',
	};
	return (
		<div className="textInput" style={containerStyle}>
			<span style={labelStyle}>{label}</span>
			<input placeholder={placeholder} />
		</div>
	);
}

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
};

class QuestionInputGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numberOfQuestions: 1,
		};
		this.addQuestionInput = this.addQuestionInput.bind(this);
	}
	addQuestionInput() {
		this.setState((previousState, previousProps) => ({
			numberOfQuestions: previousState.numberOfQuestions + 1,
		}));
	}
	render() {
		const questionInputs = [];
		for (let i = 0; i < this.state.numberOfQuestions; i++) {
			questionInputs.push(<QuestionInput key={i} />);
		}
		return (
			<div id="question_input_group">
				<h3>Questions</h3>
				<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
				<br />
				{questionInputs}
				<ExpandButton onClick={this.addQuestionInput} />
			</div>
		);
	}
}

class QuestionInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numberOfAnswers: 1,
		};
		this.addAnswerInput = this.addAnswerInput.bind(this);
	}

	addAnswerInput() {
		this.setState((previousState, previousProps) => ({
			numberOfAnswers: previousState.numberOfAnswers + 1,
		}));
	}

	render() {
		const answerInputs = [];
		for (let i = 0; i < this.state.numberOfAnswers; i++) {
			answerInputs.push(<TextInput placeholder="Twenty one." label="Answer" key={i} />);
		}
		return (<div className="question_input">
			<TextInput placeholder="What's nine plus ten?" label="Question" />
			<div className="answers_input">
				{answerInputs}
			</div>
			<ExpandButton onClick={this.addAnswerInput} />
		</div>);
	}
}

function ExpandButton({ onClick, children }) {
	const style = {
		textDecoration: 'underline',
	};
	return (
		<a onClick={onClick} style={style}>
			{children || '+More'}
		</a>
	);
}

ExpandButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	children: PropTypes.string,
};

function Checkbox({ label }) {
	const containerStyle = {
		display: 'flex',
		width: '16%',
		height: '8%',
	};

	return (
		<div className="checkbox" style={containerStyle}>
			<input type="checkbox" />
			<span>{label}</span>
		</div>
	);
}

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
};

export default QuestionConsole;
