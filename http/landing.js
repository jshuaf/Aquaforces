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

function httpGetAsync(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			return callback(xmlHttp.responseText);
		} else {
			return false;
		}
	};
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function authorizeUser() {
	const auth = gapi.auth2.getAuthInstance();
	auth.signIn().then(() => {
		const authResponse = auth.currentUser.get().getAuthResponse();
		const idToken = authResponse.id_token;
		const tokenVerificationURL = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + idToken;
		httpGetAsync(tokenVerificationURL, (responseText) => {
			const responseObject = JSON.parse(responseText);
			if (responseObject.aud == CLIENT_ID) {
				verifyID(responseObject.sub);
			}
			else {
				alert("ID Token integrity compromised.");
			}
		});
	});
}

function verifyID(id) {
	console.log(id);
}