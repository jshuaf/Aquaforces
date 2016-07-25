'use strict';
function inputRemove() {
	if (!this.value) this.parentNode.parentNode.removeChild(this.parentNode);
}
function inputParentRemove() {
	if (!this.value) this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
}

var userID = Cookies.get('userID');
if (!userID) {
	document.getElementById('content').children.forEach(function(child) {
		//child.hidden = (child.id !== 'log-in');
	});
}

var newQSet = document.getElementById('new-qset'),
	protoLi = document.getElementById('questions').firstElementChild.cloneNode(true),
	protoDetails = newQSet.firstElementChild.cloneNode(true);
function setupMoreWrong(li) {
	li.parentNode.insertBefore(li.cloneNode(true), li.nextElementSibling);
	var input = li.nextElementSibling.firstChild;
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
		var li = this.parentNode;
		if (li.nextElementSibling.nextElementSibling) li.nextElementSibling.firstChild.focus();
		else setupMoreWrong(li);
	}
}
function bindListeners() {
	document.getElementById('new-qset-summary').addEventListener('click', function() {
		if (!this.parentNode.open) requestAnimationFrame(function() {
			document.getElementById('qset-title').focus();
		});
	});
	document.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	document.getElementById('questions').querySelector('ul input').addEventListener('keypress', wrongKeypress);
	document.getElementById('more-questions').addEventListener('click', function() {
		var li = this.parentNode.parentNode;
		li.parentNode.insertBefore(protoLi.cloneNode(true), li);
		var newLi = li.previousElementSibling;
		newLi.getElementsByTagName('input')[0].addEventListener('blur', inputParentRemove);
		newLi.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
		newLi.querySelector('ul input').addEventListener('keypress', wrongKeypress);
		newLi.getElementsByTagName('input')[0].focus();
	});
}
bindListeners();
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
			answer: ins[1].value,
			incorrectAnswers: []
		};
		for (var i = 2; i < ins.length; i++) if (ins[i].value) question.incorrectAnswers.push(ins[i].value);
		questions.push(question);
	});
	requestPost('/api/new-qset', function(res) {
		newQSet.classList.remove('validating');
		if (res.indexOf('Error') == 0) {
			alert(res);
		} else {
			var details = document.createElement('details');
			details.id = 'qset-' + res;
			details.className = 'qset';
			details.appendChild(document.createElement('summary'));
			details.lastChild.appendChild(document.createElement('h2'));
			details.lastChild.lastChild.appendChild(document.createTextNode(document.getElementById('qset-title').value));
			details.appendChild(document.createElement('ol'));
			questions.forEach(function(question) {
				var li = document.createElement('li');
				li.appendChild(document.createElement('h3'));
				li.lastChild.appendChild(document.createTextNode(question.text));
				li.appendChild(document.createElement('div'));
				li.lastChild.appendChild(document.createElement('p'));
				li.lastChild.lastChild.appendChild(document.createTextNode('Correct: ' + question.answer));
				var ul = document.createElement('ul');
				question.incorrectAnswers.forEach(function(answer) {
					ul.appendChild(document.createElement('li'));
					ul.lastChild.appendChild(document.createTextNode(answer));
				});
				li.lastChild.appendChild(ul);
				details.lastChild.appendChild(li);
			});
			newQSet.parentNode.insertAfter(details, newQSet);
			newQSet.removeChild(newQSet.firstElementChild);
			newQSet.appendChild(protoDetails.cloneNode(true));
			bindListeners();
		}
	}, 'name=' + encodeURIComponent(document.getElementById('qset-title').value) + '&questions=' + encodeURIComponent(JSON.stringify(questions)));
});
var target = document.querySelector('details:target');
if (target) target.setAttribute('open', true);