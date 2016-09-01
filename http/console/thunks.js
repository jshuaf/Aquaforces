import * as actions from './actions';

const request = require('request');
/* global sweetAlert:true */

const searchRequests = [];

export function searchQuestionSets(query) {
	return (dispatch, getState) => {
		const url = `${location.protocol}//${location.host}/api/search`;
		const body = { query };
		if (!query) return;
		if (getState().requests.search) {
			getState().requests.search.forEach(req => req.req.destroy());
		}
		dispatch(actions.clearSearchRequests());
		const searchRequest = request({ url, body, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			return dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newSearchRequest(searchRequest, 'questionSetSearch'));
		searchRequests.push(searchRequest);
	};
}
