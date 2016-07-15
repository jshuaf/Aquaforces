'use strict';
var user;
gapi.load('auth2', function() {
	gapi.auth2.init({
		'client_id': '352625054764-n7d1ihmu0krk7tpc8mooolm3cueptqds.apps.googleusercontent.com',
		'scope': 'profile',
		'fetch_basic_profile': false
	}).attachClickHandler(
		document.getElementById('signin'), {},
		function(returnedUser) {
			user = returnedUser;
		},
		function(error) {
			alert(JSON.stringify(error));
		}
	);
});