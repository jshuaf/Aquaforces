import React from 'react';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import QuestionConsole from './QuestionConsole.jsx';
import NewSetForm from './NewSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';
import QuestionSet from './QuestionSet.jsx';

module.exports = (
	<Router history={browserHistory}>
		<Route path="/console" component={QuestionConsole}>
			<IndexRoute component={QuestionSetList} />
			<Route path="new" component={NewSetForm} />
		</Route>
		<Route path="/set/:shortID" compnonent={QuestionSet} />
		</Router>
);
