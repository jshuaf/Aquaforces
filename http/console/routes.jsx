import React from 'react';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import QuestionConsole from './QuestionConsole.jsx';
import NewSetForm from './NewSetForm.jsx';
import EditSetForm from './EditSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';
import QuestionSet from './QuestionSet.jsx';

module.exports = (
	<Router history={browserHistory}>
		<Route path="/">
			<Route path="console" component={QuestionConsole}>
				<IndexRoute component={QuestionSetList} />
				<Route path="new" component={NewSetForm} />
				<Route path="set/:shortID" component={QuestionSet} />
			</Route>
			<Route component={QuestionConsole}>
				<Route path="set/:shortID" component={QuestionSet} />
				<Route path="set/:shortID/edit" component={EditSetForm} />
			</Route>
		</Route>
	</Router>
);
