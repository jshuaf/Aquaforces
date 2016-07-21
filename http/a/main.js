'use strict';
String.prototype.replaceAll = function(find, replace) {
	if (typeof find == 'string') return this.split(find).join(replace);
	var t = this, i, j;
	while (typeof(i = find.shift()) == 'string' && typeof(j = replace.shift()) == 'string') t = t.replaceAll(i || '', j || '');
	return t;
};
String.prototype.repeat = function(num) {
	return new Array(++num).join(this);
};
Number.prototype.bound = function(l, h) {
	return isNaN(h) ? Math.min(this, l) : Math.max(Math.min(this, h), l);
};
HTMLCollection.prototype.indexOf = NodeList.prototype.indexOf = Array.prototype.indexOf;
HTMLCollection.prototype.forEach = NodeList.prototype.forEach = Array.prototype.forEach;
HTMLElement.prototype.insertAfter = function(newEl, refEl) {
	if (refEl.nextSibling) refEl.parentNode.insertBefore(newEl, refEl.nextSibling);
	else refEl.parentNode.appendChild(newEl);
};
function html(input) {
	return input.toString().replaceAll(['&', '<', '>', '"', '\t', '\n', '\b'], ['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '']);
}
function requestPost(uri, callback, params) {
	var i = new XMLHttpRequest();
	i.open('POST', uri, true);
	i.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	i.send(params);
	i.onload = function() {
		callback(this.status == 204 ? 'Success' : this.responseText);
	};
	return i;
}

function requestGet(url, callback) {
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
		requestGet(tokenVerificationURL, (responseText) => {
			const responseObject = JSON.parse(responseText);
			if (responseObject.aud == CLIENT_ID) {
				const userID = responseObject.sub;
				Cookies.set('userID', userID);
			}
			else {
				alert("ID Token integrity compromised.");
			}
		});
	});
}

const CLIENT_ID = '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com';

gapi.load('auth2', () => {
	gapi.auth2.init({
		'client_id': CLIENT_ID,
		'scope': 'profile',
		'fetch_basic_profile': false
	});
});