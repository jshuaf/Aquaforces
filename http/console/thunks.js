import * as actions from './actions';

const request = require('request');
/* global sweetAlert:true */

const searchRequests = [];

export function searchQuestionSets(query) {
	return (dispatch, getState) => {
		const url = `${location.protocol}//${location.host}/api/search`;
		if (!query) return;
		/* if (getState().requests.search) {
			getState().requests.search.forEach(req => req.abort());
		}*/
		/* dispatch(actions.clearSearchRequests());
		searchRequests.forEach((request) => {
			console.log(request);
			request.abort();
		});*/
		const searchRequest = request({
			url,
			body: { query },
			json: true,
			method: 'post',
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			return dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newSearchRequest(searchRequest, 'questionSetSearch'));
		searchRequests.push(searchRequest);
	};
}
