'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');
function setState(id) {
	errorEl.textContent = '';
	cont.children.forEach(function(e) {
		if (e.id != id) e.hidden = true;
	});
	document.getElementById(id).hidden = false;
	var e = document.getElementById(id).getElementsByTagName('input');
	if (e.length) e[e.length - 1].focus();
	cont.classList.toggle('pregamescreen', id != 'game');
}
var answers = [],
	correctAnswerQueue = [];
socket.onmessage = function(m) {
	console.log(m.data);
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}
	if (m.state) setState(m.state);
	if (m.event == 'notice' || m.event == 'error') errorEl.textContent = m.body;
	if (m.event == 'start-game') {
		answers = m.answers;
		lastTime = new Date().getTime();
		animationUpdate();
		setInterval(addWord, 700);
	}
	if (m.event == 'question') startQuestion(m.question);
	if (m.event == 'correct-answer') correctAnswerQueue.push(m.answer);
	if (m.event == 'answer-status') bg(m.correct ? '#0f0' : '#f00');
};
socket.onclose = function() {
	errorEl.textContent = 'Socket closed.';
};
document.getElementById('join').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({
		event: 'new-user',
		code: parseInt(document.getElementById('game-code').value),
		name: document.getElementById('crewmember-name').value
	}));
	setState('crew');
});
document.getElementById('crew').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({
		event: 'add-user-to-crew',
		crewno: parseInt(document.getElementById('crewno').value)
	}));
	document.getElementById('crewnodisplay').textContent = parseInt(document.getElementById('crewno').value);
	setState('wait');
});
var timeBar = document.getElementById('timebar'),
	timeTotal = 25,
	timeProportion = 1,
	lastTime,
	hp = 1;
var words = document.getElementById('words');
function wordClickListener() {
	socket.send(JSON.stringify({
		event: 'answer-chosen',
		text: this.firstChild.nodeValue
	}));
}
function addWord() {
	var word = document.createElement('span'),
		answer;
	if (correctAnswerQueue.length && Math.random() < 0.15) answer = correctAnswerQueue.shift();
	else answer = answers[Math.floor(Math.random() * answers.length)];
	word.appendChild(document.createTextNode(answer));
	words.appendChild(word);
	word.dataset.x = Math.random() * (innerWidth - word.offsetWidth - 8) + 4;
	word.dataset.y = -100;
	word.dataset.vx = (Math.random() - 0.5) / 100;
	word.dataset.vy = (Math.random() - 0.5) / 100 + innerHeight / 10000;
	word.style.left = '0';
	word.style.transform = 'translate(0, -100px)';
	word.addEventListener('click', wordClickListener);
}
var includeTimeBar = true;
function startQuestion(question) {
	document.getElementById('question').firstChild.firstChild.nodeValue = question;
	timeProportion = 1;
}
function failQuestion() {

}
function animationUpdate() {
	var thisTime = new Date().getTime(),
		dt = thisTime - lastTime;
	if (includeTimeBar) {
		timeBar.style.width = 100 * timeProportion + '%';
		timeBar.style.background = 'hsl(' + 110 * timeProportion + ', 100%, 50%)';
		timeProportion -= dt / timeTotal / 1000;
		if (timeProportion < 0) {
			includeTimeBar = false;
			failQuestion();
		}
	} else {
		timeBar.style.width = '0';
		timeBar.style.background = 'hsl(0, 100%, 50%)';
	}
	words.children.forEach(function(e) {
		if (parseFloat(e.dataset.x) + e.offsetWidth / 2 < innerWidth / 2) {
			e.dataset.vx = parseFloat(e.dataset.vx) + (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-parseFloat(e.dataset.x)) / 100) - Math.min(0.001, Math.exp(parseFloat(e.dataset.x) + e.offsetWidth - innerWidth * 0.35) / 100)) || 0);
		} else {
			e.dataset.vx = parseFloat(e.dataset.vx) + (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-parseFloat(e.dataset.x) + innerWidth * 0.65) / 100) - Math.min(0.001, Math.exp(parseFloat(e.dataset.x) + e.offsetWidth - innerWidth) / 100)) || 0);
		}
		e.dataset.vx /= 1.05;
		e.dataset.vy = parseFloat(e.dataset.vy) + dt * ((Math.random() - 0.5) / 10000);
		e.dataset.x = parseFloat(e.dataset.x) + parseFloat(e.dataset.vx) * dt;
		e.dataset.y = parseFloat(e.dataset.y) + parseFloat(e.dataset.vy) * dt;
		e.style.transform = 'translate(' + e.dataset.x + 'px, ' + e.dataset.y + 'px)';
		if (parseFloat(e.dataset.y) > innerHeight) words.removeChild(e);
	});
	lastTime = thisTime;
	requestAnimationFrame(animationUpdate);
}