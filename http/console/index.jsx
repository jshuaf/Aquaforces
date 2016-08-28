import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import questionConsoleReducer from './reducers.js';
import routes from './routes.jsx';

const store = createStore(questionConsoleReducer, window.devToolsExtension && window.devToolsExtension());
const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

render(
	<Provider store={store}>
		<Router history={appHistory}>{routes}</Router>
	</Provider>,
	document.getElementById('mountNode')
);
