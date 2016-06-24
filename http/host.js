'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');
function setState(id) {
	errorEl.textContent = '';
	cont.children.forEach(function(e) {
		if (e.id != id) e.hidden = true;
	});
	document.getElementById(id).hidden = false;
}
function removeUser() {
	socket.send(JSON.stringify({
		event: 'remove-user',
		user: this.dataset.username
	}));
	this.parentNode.removeChild(this);
}
function uncrewUser() {
	socket.send(JSON.stringify({
		event: 'remove-user-from-crew',
		user: this.dataset.username
	}));
	var li = document.createElement('li');
	li.dataset.username = this.dataset.username;
	li.appendChild(document.createTextNode(this.dataset.username));
	li.onclick = removeUser;
	document.getElementById('loneusers').appendChild(li);
	this.parentNode.dataset.n--;
	this.parentNode.removeChild(this);
}
socket.onmessage = function(m) {
	console.log(m.data);
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}
	if (m.event == 'notice' || m.event == 'error') alert(m.body);
	else if (m.event == 'error') {
		if (m.state) setState(m.state);
		errorEl.textContent = m.body;
	} else if (m.event == 'new-game') {
		document.getElementById('game-code-cont').appendChild(document.createTextNode(m.id));
	} else if (m.event == 'add-loneuser') {
		var li = document.createElement('li');
		li.dataset.username = m.user;
		li.appendChild(document.createTextNode(m.user));
		li.onclick = removeUser;
		document.getElementById('loneusers').appendChild(li);
	} else if (m.event == 'add-user-to-crew') {
		document.getElementById('loneusers').childNodes.forEach(function(e) {
			if (e.firstChild.nodeValue == m.user) e.parentNode.removeChild(e);
		});
		var span = document.createElement('span');
		span.dataset.username = m.user;
		span.appendChild(document.createTextNode(m.user));
		span.onclick = uncrewUser;
		document.getElementById('crews').children[m.crew - 1].appendChild(span);
		document.getElementById('crews').children[m.crew - 1].dataset.n++;
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	} else if (m.event == 'remove-user') {
		var e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
		if (e) {
			e.parentNode.removeChild(e);
			if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
		}
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	}
};
socket.onclose = function() {
	errorEl.textContent = 'Socket closed.';
};
document.getElementById('dashboard').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'new-game'}));
	setState('tgame');
});
document.getElementById('start-game-btn').addEventListener('click', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'start-game'}));
	document.getElementById('lonelyfolks').classList.add('hide');
	this.hidden = true;
	document.getElementsByClassName('studentselect').forEach(function(e) {
		e.classList.remove('studentselect');
	});
	canvas.hidden = false;
});