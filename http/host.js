'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');
isFlowing = true;
var boats = {},
	boatProto = {
		p: -0.5,
		v: 0,
		dv: 10,
		maxdv: 10,
		hp: 1,
		dhp: -0.1,
		c: -0.1,
		cf: 0.003,
		vf: 0.00001,
		raft: false
	},
	cameraP = 0,
	cameraS = 1;
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
var playing = false;
function uncrewUser() {
	if (playing) return;
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
var crewsEl = document.getElementById('crews');
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
		crewsEl.children[m.crew - 1].appendChild(span);
		crewsEl.children[m.crew - 1].dataset.n++;
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	} else if (m.event == 'remove-user') {
		var e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
		if (e) {
			if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
			e.parentNode.removeChild(e);
		}
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	} else if (m.event == 'answer') {
		var b = boats[m.crewnum];
		if (m.correct) b.v += b.dv;
		else if (m.raft) b.dv *= 0.95;
		else b.hp += b.dhp;
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
var progress = document.getElementById('progress'), lastTime;
document.getElementById('start-game-btn').addEventListener('click', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'start-game'}));
	playing = true;
	document.getElementById('lonelyfolks').classList.add('hide');
	document.getElementById('game-code-cont').hidden = document.getElementById('crew-header').hidden = this.hidden = true;
	crewsEl.classList.remove('studentselect');
	crewsEl.children.forEach(function(e, i) {
		if (e.dataset.n != 0) {
			progress.appendChild(document.createElement('div'));
			progress.lastChild.appendChild(document.createTextNode(i + 1));
			progress.lastChild.id = 'boat' + (i + 1);
			boats[i + 1] = boatProto;
		}
	});
	var n = progress.childElementCount - 1 || 1;
	progress.childNodes.forEach(function(canoe, i) {
		canoe.style.top = 'calc(' + (50 + 50 * i / n) + '% - ' + (1.6 * (2 * i / n - 0.5)) + 'em)';
		canoe.style.background = crewsEl.children[canoe.firstChild.nodeValue - 1].style.color = 'hsl(' + (-45 + 100 * i / n) + ', 80%, 40%)';
	});
	canvas.hidden = false;
	lastTime = new Date().getTime();
	animationUpdate();
});
function animationUpdate() {
	var thisTime = new Date().getTime(),
		dt = thisTime - lastTime,
		meanP = 0,
		minP = Infinity,
		maxP = -Infinity;
	for (var id in boats) {
		var b = boats[id];
		b.v += (b.c - b.v) * b.cf * dt;
		b.p += b.v * b.vf * dt;
		meanP += b.p;
		minP = Math.min(minP, b.p);
		maxP = Math.min(maxP, b.p);
	}
	meanP /= progress.childElementCount;
	var pRange = Math.max(meanP - minP, maxP - minP) * 3 / innerWidth,
		cfCP = 0.00005,
		cfCS = 0.0001;
	cameraP = (1 - dt * cfCP) * cameraP + dt * cfCP * meanP;
	if (pRange > cameraS) cameraS = (1 - dt * cfCS) * cameraS + dt * cfCS * pRange;
	for (var id in boats) {
		var b = boats[id];
		document.getElementById('boat' + id).style.transform = 'translateX(' + (b.p - cameraP + 0.5) * innerWidth * cameraS + 'px)';
	}
	lastTime = thisTime;
	requestAnimationFrame(animationUpdate);
}