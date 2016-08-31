import { render } from 'react-dom';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducer from './reducers.js';
import routes from './routes.jsx';

const store = createStore(reducer, {}, compose(
		applyMiddleware(thunk),
		window.devToolsExtension ? window.devToolsExtension() : f => f
	));

render(
	<Provider store={store}>
		{routes}
	</Provider>,
	document.getElementById('mountNode')
);
