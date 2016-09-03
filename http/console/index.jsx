import { render } from 'react-dom';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducer from './reducers.js';
import routes from './routes.jsx';

const store = createStore(reducer, undefined, compose(
		applyMiddleware(thunk),
		autoRehydrate(),
		window.devToolsExtension ? window.devToolsExtension() : f => f
));

const persistConfig = {
	whitelist: ['newQuestionSet', 'activeQuestionSet'],
};

persistStore(store, persistConfig);

render(
	<Provider store={store}>
		{routes}
	</Provider>,
	document.getElementById('mountNode')
);
