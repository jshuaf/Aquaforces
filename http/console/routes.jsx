import React from 'react';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import QuestionConsole from './QuestionConsole.jsx';
import QuestionSetForm from './QuestionSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';
import QuestionSetView from './QuestionSetView.jsx';

module.exports = (
	<Router history={browserHistory}>
		<Route path="/">
			<Route path="console" component={QuestionConsole}>
				<IndexRoute component={QuestionSetList} />
				<Route path="new" component={QuestionSetForm} />
				<Route path="set/:shortID" component={QuestionSetView} />
			</Route>
			<Route component={QuestionConsole}>
				<Route path="set/:shortID" component={QuestionSetView} />
				<Route path="set/:shortID/edit" component={QuestionSetForm} />
			</Route>
			<Route component={QuestionConsole}>
				<Route path="search/:query" component={QuestionSetList} />
			</Route>
		</Route>
	</Router>
);
