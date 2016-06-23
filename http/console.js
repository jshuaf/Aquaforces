'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/console/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');
function setState(id) {
	errorEl.textContent = '';
	cont.children.forEach(function(e) {
		if (e.id != id) e.hidden = true;
	});
	document.getElementById(id).hidden = false;
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
	else if (m.event == 'err') {
		if (m.state) setState(m.state);
		errorEl.textContent = m.body;
	} else if (m.event == 'startgame') {
		document.getElementById('game-code-cont').appendChild(document.createTextNode(m.id));
	}
};
socket.onclose = function() {
	errorEl.textContent = 'Socket closed.';
};