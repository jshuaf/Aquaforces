'use strict';
let socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
let cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');

let boats = {},
	cameraP = 0,
	cameraS = 1;
function Boat() {
	this.p = 0;
	this.v = 0;
	this.dv = 10;
	this.maxdv = 10;
	this.hp = 1;
	this.dhp = -0.05;
	this.bdhp = -0.2;
	this.c = -0.1;
	this.cf = 0.0005;
	this.vf = 0.00001;
	this.raft = false;
	this.rank = 0;
	this.prevRank = 0;
}
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
let playing = false;
function uncrewUser() {
	if (playing) return;
	socket.send(JSON.stringify({
		event: 'remove-user-from-crew',
		user: this.dataset.username
	}));
	let li = document.createElement('li');
	li.dataset.username = this.dataset.username;
	li.appendChild(document.createTextNode(this.dataset.username));
	li.onclick = removeUser;
	document.getElementById('loneusers').appendChild(li);
	this.parentNode.dataset.n--;
	this.parentNode.removeChild(this);
}
let crewsEl = document.getElementById('crews'),
	header = document.getElementById('header');
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
		header.insertBefore(document.createTextNode(m.id), header.lastChild);
	} else if (m.event == 'add-loneuser') {
		let li = document.createElement('li');
		li.dataset.username = m.user;
		li.appendChild(document.createTextNode(m.user));
		li.onclick = removeUser;
		document.getElementById('loneusers').appendChild(li);
	} else if (m.event == 'add-user-to-crew') {
		if (playing) return;
		document.getElementById('loneusers').childNodes.forEach(function(e) {
			if (e.firstChild.nodeValue == m.user) e.parentNode.removeChild(e);
		});
		let span = document.createElement('span');
		span.dataset.username = m.user;
		span.appendChild(document.createTextNode(m.user));
		span.onclick = uncrewUser;
		crewsEl.children[m.crew - 1].appendChild(span);
		crewsEl.children[m.crew - 1].dataset.n++;
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	} else if (m.event == 'remove-user') {
		if (playing) return;
		let e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
		if (e) {
			if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
			e.parentNode.removeChild(e);
		}
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
	} else if (m.event == 'answer') {
		let b = boats[m.crewnum];
		if (m.correct) b.v += b.dv;
		else if (m.raft) b.dv *= 0.95;
		else {
			b.hp += b.dhp;
			if (!b.raft && b.hp <= 0) {
				b.raft = true;
				document.getElementById('boat' + m.crewnum).classList.add('raft');
			}
			socket.send(JSON.stringify({
				event: 'update-hp',
				crewnum: m.crewnum,
				hp: b.hp
			}));
		}
	} else if (m.event == 'collide-rock') {
		let b = boats[m.crewnum];
		if (m.raft) b.dv *= 0.8;
		else {
			b.hp += b.bdhp;
			socket.send(JSON.stringify({
				event: 'update-hp',
				crewnum: m.crewnum,
				hp: b.hp
			}));
		}
	}
};
socket.onclose = function() {
	errorEl.textContent = 'Connection lost.';
};
document.getElementById('dashboard').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'new-game', qsetID: document.getElementById('qsets').value}));
	setState('tgame');
});
let progress = document.getElementById('progress'), lastTime,
	animateInterval;
document.getElementById('tgame').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'start-game'}));
	playing = true;
	document.documentElement.classList.add('hostgame');
	document.getElementById('lonelyfolks').classList.add('hide');
	document.getElementById('crew-header').hidden = document.getElementById('start-game-btn').hidden = document.getElementById('crew-info-p').hidden = true;
	crewsEl.classList.remove('studentselect');
	crewsEl.classList.add('leaderboard');
	crewsEl.children.forEach(function(e, i) {
		if (e.dataset.n != 0) {
			progress.appendChild(document.createElement('div'));
			progress.lastChild.appendChild(document.createTextNode(i + 1));
			progress.lastChild.id = 'boat' + (i + 1);
			boats[i + 1] = new Boat();
		}
	});
	let n = progress.childElementCount - 1 || 1;
	progress.childNodes.forEach(function(canoe, i) {
		canoe.style.top = 'calc(' + (50 + 50 * (i + 0.5) / (n + 1)) + '% - ' + (1.6 * (2 * (i + 0.5) / (n + 1) - 0.5)) + 'em)';
	});
	header.removeChild(header.lastChild);
	header.removeChild(header.firstChild);
	document.getElementById('subheader').hidden = true;
	lastTime = timeStart = new Date().getTime();
	animationUpdate();
	document.addEventListener('visibilitychange', function() {
		if (document.hidden && ms >= 0) animateInterval = setInterval(animationUpdate, 0);
		else {
			clearInterval(animateInterval);
			animateInterval = false;
		}
	});
});
let timeStart, ms,
	timeTotal = 300000;
function zeroPad(t) {
	if (t < 10) return '0' + t;
	return t;
}
function animationUpdate() {
	let thisTime = new Date().getTime(),
		dt = thisTime - lastTime,
		meanP = 0,
		minP = Infinity,
		maxP = -Infinity;
	for (let id in boats) {
		let b = boats[id];
		b.v += (b.c - b.v) * b.cf * dt;
		b.p += b.v * b.vf * dt;
		meanP += b.p;
		minP = Math.min(minP, b.p);
		maxP = Math.min(maxP, b.p);
		b.prevRank = b.rank;
		b.rank = 1;
	}
	for (let id in boats) {
		let b = boats[id];
		for (let id in boats) {
			let bb = boats[id];
			if (bb.p > b.p) b.rank++;
		}
		if (b.rank != b.prevRank) {
			socket.send(JSON.stringify({
				event: 'update-rank',
				crewnum: id,
				rank: b.rank
			}));
		}
	}
	meanP /= progress.childElementCount;
	let pRange = Math.max(meanP - minP, maxP - minP) * 3 / innerWidth,
		cfCP = 0.0002,
		cfCS = 0.0005;
	cameraP = (1 - dt * cfCP) * cameraP + dt * cfCP * meanP;
	if (pRange > cameraS) cameraS = (1 - dt * cfCS) * cameraS + dt * cfCS * pRange;
	for (let id in boats) {
		let b = boats[id];
		document.getElementById('boat' + id).style.transform = 'translateX(' + ((b.p - cameraP + 0.5) * 0.75 + 0.25) * innerWidth * cameraS + 'px)';
	}
	lastTime = thisTime;
	ms = timeTotal - new Date().getTime() + timeStart + 1000;
	let t = '';
	if (ms < 0) t = 'Time\'s up!';
	else if (ms < 10000) t = Math.floor(ms / 60000) + ':0' + (ms / 1000).toFixed(2);
	else t = Math.floor(ms / 60000) + ':' + zeroPad(Math.floor(ms / 1000 % 60));
	header.firstChild.nodeValue = t;
	if (!animateInterval && ms < 0) endGame();
	else if (!animateInterval) requestAnimationFrame(animationUpdate);
}
function endGame() {
	crewsEl.children.forEach(function(e, i) {
		if (boats[i + 1]) e.appendChild(document.createTextNode((boats[i + 1].p * 100).toFixed(0) + '\u2006m'));
	});
	progress.classList.add('hide');
	socket.send(JSON.stringify({
		event: 'end-game'
	}));
}