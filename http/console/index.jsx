import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import questionConsoleReducer from './reducers.js';
import routes from './routes.jsx';

const store = createStore(questionConsoleReducer, window.devToolsExtension && window.devToolsExtension());

render(
	<Provider store={store}>
		<Router history={browserHistory}>{routes}</Router>
	</Provider>,
	document.getElementById('mountNode')
);
