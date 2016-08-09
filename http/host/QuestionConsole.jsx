import React from 'react';

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

	},
	render() {
		return (
			<div id="new_set">
				<h2>New Question Set</h2>
				<TextInput label="Title" placeholder="My Question Set" />
				<QuestionInput />
				<AddButton text="Add an answer" onclick={this.addQuestionInput} />
				<Checkbox text="Private set" />
			</div>
		);
	},
});

const TextInput = React.createClass({

});
