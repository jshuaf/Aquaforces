import React from 'react';
import { IndexRoute, Route } from 'react-router';
import QuestionConsole from './QuestionConsole.jsx';
import NewSetForm from './NewSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';

module.exports = (
	<Route path="/console" component={QuestionConsole}>
		<IndexRoute component={QuestionSetList} />
		<Route path="new" component={NewSetForm} />
  </Route>
);
