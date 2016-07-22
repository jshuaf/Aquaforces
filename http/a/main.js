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

function requestGet(uri, callback) {
	var i = new XMLHttpRequest();
	i.open('GET', uri, true);
	i.onload = function() {
		callback(this.status == 204 ? 'Success' : this.responseText);
	};
	i.send(null);
}

var gAuthClientID = '891213696392-0aliq8ihim1nrfv67i787cg82paftg26.apps.googleusercontent.com';

addEventListener('DOMContentLoaded', function() {
	var logInButton = document.getElementById('log-in');
	if (logInButton) {
		gapi.load('auth2', function() {
			gapi.auth2.init({
				'client_id': gAuthClientID,
				'scope': 'profile',
				'fetch_basic_profile': false
			});
		});
		logInButton.addEventListener('click', function() {
			var auth = gapi.auth2.getAuthInstance();
			auth.signIn().then(function() {
				console.log(auth.currentUser.get().getAuthResponse().id_token);
				requestGet('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + auth.currentUser.get().getAuthResponse().id_token, function(res) {
					try {
						res = JSON.parse(res);
					} catch (e) {
						alert('Error: Invalid JSON response from Google.');
					}
					if (res.aud == gAuthClientID) requestPost('/api/login', location.reload, 'id=' + encodeURIComponent(res.sub));
					else alert('Error: Google ID Token integrity compromised.');
				});
			});
		});
	}
});