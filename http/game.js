'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error'),
	gameHasEnded = false;
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
function flash(color) {
	document.body.className = '';
	requestAnimationFrame(function() {
		document.body.classList.add('flash-' + color);
	});
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
		setInterval(addAnswer, 1200);
	}
	if (m.event == 'question') startQuestion(m.question);
	if (m.event == 'correct-answer') correctAnswerQueue.push(m.answer);
	if (m.event == 'answer-status') flash(m.correct ? 'green' : 'red');
	if (m.event == 'end-game') gameHasEnded = true;
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
		crewnum: parseInt(document.getElementById('crewnum').value)
	}));
	document.getElementById('crewnumdisplay').textContent = parseInt(document.getElementById('crewnum').value);
	setState('wait');
});
var timeBar = document.getElementById('timebar'),
	timeTotal = 25,
	timeProportion = 1,
	lastTime,
	hp = 1;
var answersEl = document.getElementById('answers');
function answerClickListener() {
	socket.send(JSON.stringify({
		event: 'answer-chosen',
		text: this.firstChild.firstChild.nodeValue
	}));
}
function addAnswer() {
	var answerEl = document.createElement('div'),
		answer,
		correctAnswer = false;
	if (correctAnswerQueue.length && Math.random() < 0.15) {
		answer = correctAnswerQueue.shift();
		correctAnswer = true;
	} else answer = answers[Math.floor(Math.random() * answers.length)];
	var answerInner = document.createElement('div');
	answerInner.appendChild(document.createTextNode(answer));
	answerEl.appendChild(answerInner);
	answersEl.appendChild(answerEl);
	answerEl.dataset.x = Math.random() * (innerWidth - answerEl.offsetWidth - 8) + 4;
	answerEl.dataset.y = 0;
	answerEl.dataset.vx = (Math.random() - 0.5) / 100;
	answerEl.dataset.vy = (Math.random() - 0.5) / 100 + innerHeight / 10000;
	answerEl.addEventListener('click', answerClickListener);
	if (correctAnswer) answerEl.classList.add('correct-answer');
}
var includeTimeBar = true;
function startQuestion(question) {
	document.getElementById('question').firstChild.firstChild.nodeValue = question;
	timeProportion = 1;
	includeTimeBar = true;
}
function failQuestion() {
	socket.send(JSON.stringify({
		event: 'timeout-question',
		text: document.getElementById('question').firstChild.firstChild.nodeValue
	}));
	flash('yellow');
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
	answersEl.children.forEach(function(e) {
		if (parseFloat(e.dataset.x) + e.offsetWidth / 2 < innerWidth / 2) {
			e.dataset.vx = parseFloat(e.dataset.vx) + (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-parseFloat(e.dataset.x)) / 100) - Math.min(0.001, Math.exp(parseFloat(e.dataset.x) + e.offsetWidth - innerWidth * 0.38) / 100)) || 0);
		} else {
			e.dataset.vx = parseFloat(e.dataset.vx) + (dt * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-parseFloat(e.dataset.x) + innerWidth * 0.62) / 100) - Math.min(0.001, Math.exp(parseFloat(e.dataset.x) + e.offsetWidth - innerWidth) / 100)) || 0);
		}
		e.dataset.vx /= 1.05;
		e.dataset.vy = parseFloat(e.dataset.vy) + dt * ((Math.random() - 0.5) / 10000);
		if (parseFloat(e.dataset.vy) < 0.05) e.dataset.vy = +e.dataset.vy + 0.1;
		e.dataset.x = parseFloat(e.dataset.x) + parseFloat(e.dataset.vx) * dt;
		e.dataset.y = parseFloat(e.dataset.y) + parseFloat(e.dataset.vy) * dt;
		e.style.transform = 'translate(' + e.dataset.x + 'px, ' + e.dataset.y + 'px)';
		if (parseFloat(e.dataset.y) > innerHeight) {
			if (e.classList.contains('correct-answer')) {
				socket.send(JSON.stringify({
					event: 'resend-answer',
					text: e.firstChild.firstChild.nodeValue
				}));
			}
			answersEl.removeChild(e);
		}
	});
	lastTime = thisTime;
	if (!gameHasEnded) requestAnimationFrame(animationUpdate);
}