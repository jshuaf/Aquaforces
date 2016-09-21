import React from 'react';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import QuestionConsole from './QuestionConsole.jsx';
import EditQuestionSet from './EditQuestionSet.jsx';
import QuestionSetList from './QuestionSetList.jsx';
import CreateQuestionSet from './CreateQuestionSet.jsx';
import ViewQuestionSet from './ViewQuestionSet.jsx';

module.exports = (
	<Router history={browserHistory}>
		<Route path="/">
			<Route path="console" component={QuestionConsole}>
				<IndexRoute component={QuestionSetList} />
				<Route path="new" component={CreateQuestionSet} />
				<Route path="set/:shortID" component={ViewQuestionSet} />
			</Route>
			<Route component={QuestionConsole}>
				<Route path="set/:shortID" component={ViewQuestionSet} />
				<Route path="set/:shortID/edit" component={EditQuestionSet} />
				<Route path="search/:query" component={QuestionSetList} />
			</Route>
		</Route>
	</Router>
);
