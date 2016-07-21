'use strict';
var user;
const CLIENT_ID = '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com';

gapi.load('auth2', () => {
	gapi.auth2.init({
		'client_id': CLIENT_ID,
		'scope': 'profile',
		'fetch_basic_profile': false
	});
	document.getElementById('log-in').addEventListener('click', authorizeUser);
});