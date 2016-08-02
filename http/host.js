'use strict';
if (location.hash) {
	setTimeout(function() {
		var prevScrollY = scrollY;
		location.hash = '';
		scrollTo(scrollX, prevScrollY);
	}, 1000);
}
function inputRemove() {
	if (!this.value) this.parentNode.parentNode.removeChild(this.parentNode);
}
function inputParentRemove() {
	if (!this.value) this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
}
var newQSet = document.getElementById('new-qset'),
	protoLi = document.getElementById('questions').firstElementChild.cloneNode(true),
	protoDetails = newQSet.firstElementChild.cloneNode(true);
function setupMoreWrong(li) {
	li.parentNode.insertBefore(li.cloneNode(true), li.nextElementSibling);
	li.nextElementSibling.firstChild.checked = false;
	var input = li.nextElementSibling.lastChild;
	input.value = '';
	input.focus();
	input.addEventListener('blur', inputRemove);
	input.addEventListener('keypress', wrongKeypress);
}
function moreWrong() {
	setupMoreWrong(this.parentNode.parentNode.previousElementSibling);
}
function wrongKeypress(e) {
	if (e.which == 13) {
		e.preventDefault();
		if (e.shiftKey) {
			var li = this.parentNode.parentNode.parentNode.nextElementSibling;
			li.parentNode.insertBefore(protoLi.cloneNode(true), li);
			bindQuestionListeners(li.previousElementSibling, {isNewQSet: true});
		} else {
			var li = this.parentNode;
			if (li.nextElementSibling.nextElementSibling) li.nextElementSibling.lastChild.focus();
			else setupMoreWrong(li);
		}
	}
}
function buildQuestion(question) {
	var li = document.createElement('li');
	li.appendChild(document.createElement('a'));
	li.lastChild.className = 'edit';
	li.lastChild.title = 'edit question';
	li.lastChild.appendChild(document.createTextNode('✎'));
	li.lastChild.addEventListener('click', startEdit);
	li.appendChild(document.createElement('h3'));
	li.lastChild.appendChild(document.createTextNode(question.text));
	li.appendChild(document.createElement('div'));
	var ulc = document.createElement('ul');
	ulc.className = 'check-list';
	question.answers.forEach(function(answer) {
		ulc.appendChild(document.createElement('li'));
		ulc.lastChild.appendChild(document.createTextNode(answer));
	});
	li.lastChild.appendChild(ulc);
	var uli = document.createElement('ul');
	uli.className = 'cross-list';
	question.incorrectAnswers.forEach(function(answer) {
		uli.appendChild(document.createElement('li'));
		uli.lastChild.appendChild(document.createTextNode(answer));
	});
	li.lastChild.appendChild(uli);
	return li;
}
function buildQuestionEditor(question, isNewQ) {
	var li = document.createElement('li');
	li.className = isNewQ ? 'q-edit q-add' : 'q-edit';
	if (!isNewQ) li.hidden = true;
	li.appendChild(document.createElement('a'));
	li.lastChild.className = 'discard';
	li.lastChild.title = 'discard edits';
	li.lastChild.appendChild(document.createTextNode('✕'));
	var form = document.createElement('form');
	li.appendChild(form);
	form.appendChild(document.createElement('label'));
	form.lastChild.appendChild(document.createTextNode('Question '));
	form.lastChild.appendChild(document.createElement('input'));
	form.lastChild.lastChild.placeholder = 'What\'s one plus one?';
	form.lastChild.lastChild.required = true;
	form.lastChild.lastChild.maxLength = 144;
	form.lastChild.lastChild.value = question.text;
	form.appendChild(document.createElement('p'));
	form.lastChild.appendChild(document.createTextNode('Answers:'));
	var ul = document.createElement('ul');
	question.answers.forEach(function(answer) {
		var li = document.createElement('li');
		ul.appendChild(li);
		li.appendChild(document.createElement('input'));
		li.lastChild.type = 'checkbox';
		li.lastChild.checked = true;
		li.appendChild(document.createTextNode(' '));
		li.appendChild(document.createElement('input'));
		li.lastChild.required = true;
		li.lastChild.maxLength = 64;
		li.lastChild.placeholder = 'Two';
		li.lastChild.value = answer;
		li.lastChild.checked = true;
	});
	question.incorrectAnswers.forEach(function(answer) {
		var li = document.createElement('li');
		ul.appendChild(li);
		li.appendChild(document.createElement('input'));
		li.lastChild.type = 'checkbox';
		li.appendChild(document.createTextNode(' '));
		li.appendChild(document.createElement('input'));
		li.lastChild.required = true;
		li.lastChild.maxLength = 64;
		li.lastChild.placeholder = 'Two';
		li.lastChild.value = answer;
		li.lastChild.checked = true;
	});
	var more = document.createElement('li');
	ul.appendChild(more);
	more.appendChild(document.createElement('small'));
	more.lastChild.appendChild(document.createElement('a'));
	more.lastChild.lastChild.className = 'more-wrong';
	more.lastChild.lastChild.title = '↵';
	more.lastChild.lastChild.appendChild(document.createTextNode('+ more'));
	form.appendChild(ul);
	form.appendChild(document.createElement('button'));
	form.lastChild.className = 'submit-q-edit';
	form.lastChild.appendChild(document.createTextNode(isNewQ ? 'Add Question' : 'Submit Edit'));
	if (isNewQ) bindQuestionListeners(li, {isNewQ: true});
	else bindQuestionListeners(li);
	return li;
}
function editQuestionSubmit(e) {
	e.preventDefault();
	this.classList.add('validating');
	var inv = this.querySelector(':invalid');
	if (inv) return inv.focus();
	var isNewQ = this.parentNode.classList.contains('q-add'),
		ins = this.getElementsByTagName('input');
	if (ins.length == 0) return;
	var question = {
		text: ins[0].value,
		answers: [],
		incorrectAnswers: []
	};
	for (var i = 1; i < ins.length; i += 2) if (ins[i + 1].value) question[ins[i].checked ? 'answers' : 'incorrectAnswers'].push(ins[i + 1].value);
	var el = this.parentNode;
	requestPost('/api/edit-question', function(res) {
		el.lastChild.classList.remove('validating');
		if (res.indexOf('Error') == 0) alert(res);
		else {
			el.hidden = true;
			el.parentNode.removeChild(el.previousElementSibling);
			el.parentNode.insertBefore(buildQuestion(question), el);
			if (isNewQ) {
				el.classList.remove('q-add');
				el.lastChild.lastChild.firstChild.nodeValue = 'Submit Edit';
			}
		}
	},
		'id=' + encodeURIComponent(el.parentNode.parentNode.id.substr(5)) +
		'&num=' + (isNewQ ? 'new' : el.parentNode.children.indexOf(el.previousElementSibling) / 2) +
		'&question=' + encodeURIComponent(JSON.stringify(question))
	);
}
function bindQuestionListeners(li, options) {
	options = options || {};
	if (!options.isNewQSet) bindDiscardListener(li.getElementsByClassName('discard')[0]);
	if (options.isNewQSet) li.getElementsByTagName('input')[0].addEventListener('blur', inputParentRemove);
	li.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	li.querySelector('ul input:not([type=\'checkbox\'])').addEventListener('keypress', wrongKeypress);
	li.getElementsByTagName('input')[0].focus();
	li.lastChild.addEventListener('submit', editQuestionSubmit);
}
function bindListeners() {
	document.getElementById('new-qset-summary').addEventListener('click', function() {
		if (!this.parentNode.open) requestAnimationFrame(function() {
			document.getElementById('qset-title').focus();
		});
	});
	document.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	document.getElementById('questions').querySelector('ul input:not([type=\'checkbox\'])').addEventListener('keypress', wrongKeypress);
	document.getElementById('more-questions').addEventListener('click', function() {
		var li = this.parentNode.parentNode;
		li.parentNode.insertBefore(protoLi.cloneNode(true), li);
		bindQuestionListeners(li.previousElementSibling, {isNewQSet: true});
	});
}
bindListeners();
document.getElementsByClassName('q-edit').forEach(bindQuestionListeners);
function startEdit() {
	this.parentNode.hidden = true;
	this.parentNode.nextElementSibling.hidden = false;
	this.parentNode.nextElementSibling.getElementsByTagName('input')[0].focus();
}
function discardEdit() {
	this.parentNode.hidden = true;
	if (!this.parentNode.classList.contains('q-add')) this.parentNode.previousElementSibling.hidden = false;
}
function newQuestion() {
	var newQ = buildQuestionEditor({text: '', answers: [''], incorrectAnswers: []}, {isNewQ: true});
	newQ.hidden = false;
	this.parentNode.children[1].appendChild(newQ);
	newQ.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	newQ.getElementsByTagName('input')[0].focus();
}
function bindEditListener(editBtn) {
	editBtn.addEventListener('click', startEdit);
}
function bindDiscardListener(discardBtn) {
	discardBtn.addEventListener('click', discardEdit);
}
function bindNewQuestionListener(nqBtn) {
	nqBtn.addEventListener('click', newQuestion);
}
document.getElementsByClassName('edit').forEach(bindEditListener);
document.getElementsByClassName('discard').forEach(bindDiscardListener);
document.getElementsByClassName('new-question').forEach(bindNewQuestionListener);
newQSet.addEventListener('submit', function(e) {
	e.preventDefault();
	this.classList.add('validating');
	var inv = this.querySelector(':invalid');
	if (inv) return inv.focus();
	var questions = [];
	document.getElementById('questions').children.forEach(function(e) {
		var ins = e.getElementsByTagName('input');
		if (ins.length == 0) return;
		var question = {
			text: ins[0].value,
			answers: [],
			incorrectAnswers: []
		};
		for (var i = 1; i < ins.length; i += 2) if (ins[i + 1].value) question[ins[i].checked ? 'answers' : 'incorrectAnswers'].push(ins[i + 1].value);
		questions.push(question);
	});
	requestPost('/api/new-qset', function(res) {
		newQSet.classList.remove('validating');
		if (res.indexOf('Error') == 0) alert(res);
		else {
			var details = document.createElement('details');
			details.id = 'qset-' + res;
			details.className = 'qset';
			details.appendChild(document.createElement('summary'));
			details.lastChild.appendChild(document.createElement('h2'));
			details.lastChild.lastChild.appendChild(document.createTextNode(document.getElementById('qset-title').value));
			details.lastChild.appendChild(document.createTextNode(' '));
			details.lastChild.appendChild(document.createElement('small'));
			var small = details.lastChild.lastChild;
			small.appendChild(document.createElement('a'));
			small.lastChild.className = 'play';
			small.lastChild.appendChild(document.createTextNode('▶Play'));
			small.appendChild(document.createTextNode(' '));
			small.appendChild(document.createElement('a'));
			small.lastChild.className = 'dup';
			small.lastChild.appendChild(document.createTextNode('Duplicate'));
			small.appendChild(document.createTextNode(' '));
			small.appendChild(document.createElement('a'));
			small.lastChild.className = small.lastChild.title = 'delete';
			small.lastChild.appendChild(document.createTextNode('✕'));
			small.appendChild(document.createTextNode(' '));
			small.appendChild(document.createElement('a'));
			small.lastChild.title = 'permalink';
			small.lastChild.href = '#qset-' + res;
			small.lastChild.appendChild(document.createTextNode('#'));
			details.appendChild(document.createElement('ol'));
			questions.forEach(function(question) {
				details.lastChild.appendChild(buildQuestion(question));
				details.lastChild.appendChild(buildQuestionEditor(question));
			});
			details.appendChild(document.createElement('a'));
			details.lastChild.className = 'new-question';
			details.lastChild.appendChild(document.createTextNode('add question'));
			bindNewQuestionListener(details.lastChild);
			newQSet.parentNode.insertAfter(details, newQSet);
			newQSet.removeChild(newQSet.firstElementChild);
			newQSet.appendChild(protoDetails.cloneNode(true));
			bindListeners();
		}
	}, 'name=' + encodeURIComponent(document.getElementById('qset-title').value) + '&questions=' + encodeURIComponent(JSON.stringify(questions)));
});
var target = document.querySelector('details:target');
if (target) target.setAttribute('open', true);
document.getElementsByClassName('dup').forEach(function(el) {
	el.addEventListener('click', function(e) {
		e.preventDefault();
	});
});
document.getElementsByClassName('delete').forEach(function(el) {
	el.addEventListener('click', function(e) {
		e.preventDefault();
	});
});
document.getElementsByClassName('play').forEach(function(el) {
	el.addEventListener('click', function(e) {
		e.preventDefault();
		document.getElementById('qset-cont').hidden = true;
		document.documentElement.classList.remove('no-bg');
		startHost(this.parentNode.parentNode.parentNode.id.substr(5));
	});
});

var socket = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
function startHost(id) {
	socket.send(JSON.stringify({event: 'new-game', qsetID: id}));
	var cont = document.getElementById('cont'),
		errorEl = document.getElementById('error');
	cont.hidden = false;
	var boats = {},
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
		this.c = 0;
		this.cf = 0.0005;
		this.vf = 0.00001;
		this.raft = false;
		this.rank = 0;
		this.prevRank = 0;
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
	var crewsEl = document.getElementById('crews'),
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
			var li = document.createElement('li');
			li.dataset.username = m.user;
			li.appendChild(document.createTextNode(m.user));
			li.onclick = removeUser;
			document.getElementById('loneusers').appendChild(li);
		} else if (m.event == 'add-user-to-crew') {
			if (playing) return;
			document.getElementById('loneusers').childNodes.forEach(function(e) {
				if (e.firstChild.nodeValue == m.user) e.parentNode.removeChild(e);
			});
			var span = document.createElement('span');
			span.dataset.username = m.user;
			span.appendChild(document.createTextNode(m.user));
			span.onclick = uncrewUser;
			crewsEl.children[m.crew - 1].appendChild(span);
			crewsEl.children[m.crew - 1].dataset.n++;
			document.getElementById('game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		} else if (m.event == 'remove-user') {
			if (playing) return;
			var e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
			if (e) {
				if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
				e.parentNode.removeChild(e);
			}
			document.getElementById('game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		} else if (m.event == 'answer' || m.event == 'timeout-question') {
			var b = boats[m.crewnum];
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
			var b = boats[m.crewnum];
			if (m.raft) b.dv *= 0.8;
			else {
				b.hp += b.bdhp;
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
		}
	};
	socket.onclose = function() {
		errorEl.textContent = 'Connection lost.';
	};
	var progress = document.getElementById('progress'), lastTime,
		animateInterval;
	document.getElementById('tgame').addEventListener('submit', function(e) {
		e.preventDefault();
		if (playing) return timeTotal = 0;
		socket.send(JSON.stringify({event: 'start-game'}));
		playing = true;
		document.documentElement.classList.add('hostgame');
		document.getElementById('lonelyfolks').classList.add('hide');
		document.getElementById('crew-header').hidden = document.getElementById('crew-info-p').hidden = true;
		document.getElementById('game-btn').firstChild.nodeValue = 'End game';
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
		var n = progress.childElementCount - 1 || 1;
		progress.childNodes.forEach(function(canoe, i) {
			canoe.style.top = 'calc(' + (50 + 50 * (i + 0.5) / (n + 1)) + '% - ' + (1.6 * (2 * (i + 0.5) / (n + 1) - 0.5)) + 'em)';
		});
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
	var timeStart, ms,
		timeTotal = 300000;
	function zeroPad(t) {
		if (t < 10) return '0' + t;
		return t;
	}
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
			b.prevRank = b.rank;
			b.rank = 1;
		}
		for (var id in boats) {
			var b = boats[id];
			for (var id in boats) {
				var bb = boats[id];
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
		var pRange = Math.max(meanP - minP, maxP - minP) * 3 / innerWidth,
			cfCP = 0.0002,
			cfCS = 0.0005;
		cameraP = (1 - dt * cfCP) * cameraP + dt * cfCP * meanP;
		if (pRange > cameraS) cameraS = (1 - dt * cfCS) * cameraS + dt * cfCS * pRange;
		for (var id in boats) {
			var b = boats[id];
			document.getElementById('boat' + id).style.transform = 'translateX(' + ((b.p - cameraP + 0.5) * 0.75 + 0.25) * innerWidth * cameraS + 'px)';
		}
		document.documentElement.style.backgroundPositionX = cameraP * 100 + '%';
		lastTime = thisTime;
		ms = timeTotal - new Date().getTime() + timeStart + 1000;
		var t = '';
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
}