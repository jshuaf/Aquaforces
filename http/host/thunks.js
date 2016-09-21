import * as actions from './actions';

const request = require('request');
/* global sweetAlert:true */

export function authenticateUser() {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/authenticate`;
		request({ url, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.authenticateUser(res.body));
		});
	};
}
