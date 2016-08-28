import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import questionConsoleReducer from './reducers.js';
import routes from './routes.jsx';

const store = createStore(questionConsoleReducer, window.devToolsExtension && window.devToolsExtension());

render(
	<Provider store={store}>
		{routes}
	</Provider>,
	document.getElementById('mountNode')
);
