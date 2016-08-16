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
	addQuestionInput() {
		return;
	},
	render() {
		return (
			<div id="new_set">
				<h2>New Question Set</h2>
				<TextInput label="Title" placeholder="My Question Set" />
				<QuestionInputGroup />
				<ExpandButton text="Add an answer" onclick={this.addQuestionInput} />
				<Checkbox text="Private set" />
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

const QuestionInputGroup = React.createClass({
	render() {
		return (
			<div id="question_input_group">
				<h3>Questions</h3>
				<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
				<br />
				<QuestionInput />
				<ExpandButton />
			</div>
		);
	},
});

class QuestionInput extends React.Component {
	getInitialState() {
		return {
			numberOfAnswers: 1,
		};
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
				<TextInput placeholder="Twenty one." label="Answer" />
			</div>
			<ExpandButton onclick={this.addAnswerInput} />
		</div>);
	}
}

function ExpandButton({ onclick, children }) {
	const style = {

	};
	return (
		<button onClick={onclick} style={style}>
			{children || 'More'}
		</button>
	);
}

ExpandButton.propTypes = {
	onclick: PropTypes.func.isRequired,
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
