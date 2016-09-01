import * as actions from './actions';

const request = require('request');
/* global sweetAlert:true */

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
			dispatch(actions.clearSearchRequests());
			return dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newSearchRequest(searchRequest, 'questionSetSearch'));
	};
}

export function submitQuestionSet(set) {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/new-qset`;
		request({
			url,
			method: 'post',
			json: true,
			body: set,
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.clearNewQuestionSet());
			location.href = '/console';
		});
	};
}

export function authenticateUser() {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/authenticate`;
		request({ url, json: true, method: 'post' }, (error, res, body) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.authenticateUser(body));
		});
	};
}

export function getQuestionSet(shortID) {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/get-qset`;
		request({ url, body: { shortID }, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) {
				return sweetAlert({ title: res.body, type: 'error' }, () => { location.href = '/console'; });
			}
			console.log('recieved', res.body);
			dispatch(actions.populateActiveQuestionSet(res.body));
		});
	};
}

export function deleteQuestionSet(id) {
	return () => {
		const url = `${location.protocol}//${location.host}/api/delete-qset`;
		request({ url, body: { id },	json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			location.href = '/console';
		});
	};
}
