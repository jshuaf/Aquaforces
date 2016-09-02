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
		dispatch(actions.clearRequests('search'));
		const searchRequest = request({ url, body, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.clearRequests('search'));
			return dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newRequest(searchRequest, 'questionSetSearch'));
	};
}

export function submitQuestionSet(set) {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/new-qset`;
		const createRequest = request({
			url,
			method: 'post',
			json: true,
			body: set,
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.clearNewQuestionSet());
			dispatch(actions.clearRequests('create'));
			location.href = `/set/${res.body.shortID}`;
		});
		dispatch(actions.newRequest('create', createRequest));
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
		const getRequest = request({ url, body: { shortID }, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) {
				return sweetAlert({ title: res.body, type: 'error' }, () => { location.href = '/console'; });
			}
			dispatch(actions.clearRequests('get'));
			dispatch(actions.populateActiveQuestionSet(res.body));
		});
		dispatch(actions.newRequest('get', getRequest));
	};
}

export function deleteQuestionSet(id) {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/delete-qset`;
		const editRequest = request({ url, body: { id },	json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.clearRequests('edit'));
			location.href = '/console';
		});
		dispatch(actions.newRequest('edit', editRequest));
	};
}

export function getQuestionSets() {
	return (dispatch) => {
		const url = `${location.protocol}//${location.host}/api/get-qsets`;
		const searchRequest = request({ url, body: {}, json: true, method: 'post' }, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			dispatch(actions.clearRequests('search'));
			dispatch(actions.populateQuestionSetList(res.body));
		});
		dispatch(actions.newRequest('search', searchRequest));
	};
}
