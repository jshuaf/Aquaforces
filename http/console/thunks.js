import * as actions from './actions';

const request = require('request');
/* global sweetAlert:true */

export default function searchQuestionSets(query) {
	return (dispatch, getState) => {
		const url = `${location.protocol}//${location.host}/api/search`;
		if (!query) return;
		getState().requests.search.forEach(req => req.abort());
		dispatch(actions.clearSearchRequests());
		const searchRequest = request({
			url,
			body: { query },
			json: true,
			method: 'post',
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newSearchRequest(searchRequest, 'questionSetSearch'));
	};
}
