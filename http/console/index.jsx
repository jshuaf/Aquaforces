import { render } from 'react-dom';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import QuestionConsole from './QuestionConsole.jsx';
import questionConsoleReducer from './reducers.js';

const store = createStore(questionConsoleReducer, window.devToolsExtension && window.devToolsExtension());

render(
	<Provider store={store}>
		<QuestionConsole />
	</Provider>,
	document.getElementById('mountNode')
);
