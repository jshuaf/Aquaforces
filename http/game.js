'use strict';
var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error'),
	rockEl = document.getElementById('rock'),
	gameHasEnded = false;
function setState(id) {
	errorEl.textContent = '';
	cont.children.forEach(function(e) {
		if (e.id != id) e.hidden = true;
	});
	document.getElementById(id).hidden = false;
	var e = document.getElementById(id).getElementsByTagName('input');
	if (e.length) e[e.length - 1].focus();
	document.documentElement.classList.toggle('no-bg', id == 'game');
}
function flash(color) {
	var colors = ['red', 'yellow', 'green', 'red-double', 'green-double'];
	colors.forEach(function(cName) {
		document.documentElement.classList.remove('flash-' + cName);
	});
	requestAnimationFrame(function() {
		document.documentElement.classList.add('flash-' + color);
	});
}
var rock = {},
	answers = [],
	correctAnswerQueue = [],
	addAnswerInterval;
socket.onmessage = function(m) {
	console.log(m.data);
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}
	if (m.state) setState(m.state);
	if (m.event == 'notice' || m.event == 'error') {
		errorEl.textContent = m.body;
		errorEl.scrollIntoView();
	}
	if (m.event == 'start-game') {
		answers = m.answers;
		lastTime = new Date().getTime();
		animationUpdate();
		addAnswerInterval = setInterval(addAnswer, 2500);
	}
	if (m.event == 'question') startQuestion(m.question);
	if (m.event == 'correct-answer') correctAnswerQueue.push(m.answer);
	if (m.event == 'answer-status') flash(m.correct ? 'green' : 'red');
	if (m.event == 'answer-submitted') addSubmittedAnswer(m.text, m.correct);
	if (m.event == 'rock') initRock();
	if (m.event == 'rock-answer-status') moveRock(m.streak);
	if (m.event == 'collide-rock') collideRock();
	if (m.event == 'end-rock') moveRock(7);
	if (m.event == 'update-rank') document.getElementById('rank').firstChild.nodeValue = m.rank;
	if (m.event == 'end-game') endGame();
};
document.addEventListener('visibilitychange', function() {
	if (document.hidden) clearInterval(addAnswerInterval);
	else if (addAnswerInterval) addAnswerInterval = setInterval(addAnswer, 2500);
});
function addSubmittedAnswer(text, correct) {
	var span = document.createElement('span');
	span.appendChild(document.createTextNode(text));
	if (correct) span.className = 'correct';
	document.getElementById('past-answers').insertBefore(span, document.getElementById('past-answers').firstChild);
}
function collideRock() {
	document.getElementById('subheading').hidden = true;
	rock.shown = false;
	flash('red-double');
}
function initRock() {
	document.getElementById('subheading').hidden = false;
	rock.shown = true;
	rock.x = innerWidth / 2;
	rock.y = 0;
	rock.vx = 0;
	rock.vy = innerHeight / 100000;
	rock.direction = Math.random() < 0.5 ? -1 : 1;
	rock.position = 0;
}
function moveRock(newPosition) {
	rock.vx += rock.direction * (newPosition - rock.position) * innerWidth / 10000;
	rock.position = newPosition;
}
socket.onclose = function() {
	errorEl.textContent = 'Connection lost.';
	errorEl.scrollIntoView();
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
	this.parentNode.removeChild(this);
	socket.send(JSON.stringify({
		event: 'answer-chosen',
		text: this.firstChild.firstChild.nodeValue
	}));
}
function addAnswer() {
	var answerEl = document.createElement('div'),
		answer,
		correctAnswer = false;
	if (correctAnswerQueue.length && Math.random() < 0.4) {
		answer = correctAnswerQueue.shift();
		correctAnswer = true;
	} else answer = answers[Math.floor(Math.random() * answers.length)];
	var answerInner = document.createElement('div');
	answerInner.appendChild(document.createTextNode(answer));
	if (Math.random() < 0.4) answerEl.classList.add('alt');
	answerEl.appendChild(answerInner);
	answersEl.appendChild(answerEl);
	answerEl.dataset.x = Math.random() * (innerWidth - answerEl.offsetWidth - 8) + 4;
	answerEl.dataset.y = 0;
	answerEl.dataset.vx = (Math.random() - 0.5) / 100;
	answerEl.dataset.vy = (Math.random() - 0.5) / 100 + innerHeight / 10000;
	answerEl.addEventListener('click', answerClickListener);
	if (correctAnswer) answerEl.classList.add('correct-answer');
}
function startQuestion(question) {
	document.getElementById('question').firstChild.firstChild.nodeValue = question;
	timeProportion = 1;
}
function failQuestion() {
	socket.send(JSON.stringify({
		event: 'timeout-question',
		text: document.getElementById('question').firstChild.firstChild.nodeValue
	}));
	flash('yellow');
	timeProportion = 1;
}
function animationUpdate() {
	var thisTime = new Date().getTime(),
		dt = thisTime - lastTime;
	timeBar.style.width = 100 * timeProportion + '%';
	timeBar.style.background = 'hsl(' + 110 * timeProportion + ', 100%, 50%)';
	timeProportion -= dt / timeTotal / 1000;
	if (timeProportion < 0) failQuestion();
	answersEl.children.forEach(function(e) {
		if (+e.dataset.x + e.offsetWidth / 2 < innerWidth / 2) {
			e.dataset.vx = +e.dataset.vx + (dt * +e.dataset.y / innerHeight * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-e.dataset.x) / 30) - Math.min(0.001, Math.exp(+e.dataset.x + e.offsetWidth - innerWidth * 0.42) / 30)) || 0);
		} else {
			e.dataset.vx = +e.dataset.vx + (dt * +e.dataset.y / innerHeight * ((Math.random() - 0.5) / 10000 + Math.min(0.001, Math.exp(-e.dataset.x + innerWidth * 0.58) / 30) - Math.min(0.001, Math.exp(+e.dataset.x + e.offsetWidth - innerWidth) / 30)) || 0);
		}
		answersEl.children.forEach(function(f) {
			if (e == f) return;
			var sd = (+e.dataset.vx - f.dataset.vx) * (+e.dataset.vx - f.dataset.vx) + (+e.dataset.vy - f.dataset.vy) * (+e.dataset.vy - f.dataset.vy);
			e.dataset.vx = +e.dataset.vx - 1e-5 * (+e.dataset.vx - f.dataset.vx) / sd;
			e.dataset.vx = +e.dataset.vx - 1e-5 * (+e.dataset.vy - f.dataset.vy) / sd;
		});
		e.dataset.vx /= 1.05;
		e.dataset.vy = +e.dataset.vy + dt * ((Math.random() - 0.5) / 10000);
		if (+e.dataset.vy < 0.01) e.dataset.vy = +e.dataset.vy + 0.005;
		e.dataset.x = +e.dataset.x + +e.dataset.vx * dt;
		e.dataset.y = +e.dataset.y + +e.dataset.vy * dt;
		e.style.transform = 'translate(' + e.dataset.x + 'px, ' + e.dataset.y + 'px)';
		if (+e.dataset.y > innerHeight) {
			if (e.classList.contains('correct-answer')) {
				socket.send(JSON.stringify({
					event: 'resend-answer',
					text: e.firstChild.firstChild.nodeValue
				}));
			}
			answersEl.removeChild(e);
		}
	});
	if (rock.shown) {
		rock.x += dt * rock.vx;
		rock.y += dt * rock.vy;
		rock.vx /= 1 + dt * 0.001;
		rockEl.removeAttribute('hidden');
		rockEl.style.transform = 'translate(' + rock.x + 'px, ' + rock.y + 'px)';
	} else rockEl.setAttribute('hidden', true);
	lastTime = thisTime;
	if (!gameHasEnded) requestAnimationFrame(animationUpdate);
}
function endGame() {
	gameHasEnded = true;
	clearInterval(addAnswerInterval);
	addAnswerInterval = false;
	document.documentElement.classList.add('gameover');
}