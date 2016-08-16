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

const TextInput = ({ placeholder, label }) => {
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
};

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
};

const QuestionInputGroup = React.createClass({
	render() {
		return (
			<div id="question_input">
				<h3>Questions</h3>
				<span style={{ fontStyle: 'italic' }}>Avoid synonyms among answers.</span>
				<br />
				<QuestionInput />
				<ExpandButton />
			</div>
		);
	},
});

const QuestionInput = React.createClass({
	render() {
		return <div>QInput</div>;
	},
});

const ExpandButton = ({ onclick, children }) => {
	const style = {

	};
	return (
		<button onClick={onclick} style={style}>
			{children || 'More'}
		</button>
	);
};

ExpandButton.propTypes = {
	onclick: PropTypes.func.isRequired,
	children: PropTypes.string,
};

const Checkbox = ({ label }) => {
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
};

Checkbox.propTypes = {
	label: PropTypes.string.isRequired,
};

export default QuestionConsole;
