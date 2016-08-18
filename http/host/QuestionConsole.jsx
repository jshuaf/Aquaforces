import React from 'react';
import NewSetForm from './NewSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';

function QuestionConsole() {
	return (
		<div id="questionConsole">
			<NewSetForm />
			<QuestionSetList />
		</div>
	);
}

export default QuestionConsole;
