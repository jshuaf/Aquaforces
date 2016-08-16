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
				<QuestionInput />
				<ExpandButton text="Add an answer" onclick={this.addQuestionInput} />
				<Checkbox text="Private set" />
			</div>
		);
	},
});

const TextInput = ({ placeholder, label }) => {
	const style = {
		borderWidth: 1,
		borderColor: 'gray',
		borderStyle: 'solid',
	};
	return <input placeholder={placeholder} text={label} style={style} />;
};

TextInput.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string.isRequired,
};

const QuestionInput = React.createClass({
	render() {
		return <div>Questions</div>;
	},
});

const ExpandButton = React.createClass({
	render() {
		return <button>More</button>;
	},
});

const Checkbox = React.createClass({
	render() {
		return <div>Check me</div>;
	},
});

export default QuestionConsole;
