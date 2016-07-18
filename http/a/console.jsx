'use strict';
function inputRemove() {
	if (!this.value) this.parentNode.parentNode.removeChild(this.parentNode);
}
function inputParentRemove() {
	if (!this.value) this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
}
var newQSet = document.getElementById('new-qset'),
	protoLi = document.getElementById('questions').firstElementChild.cloneNode(true),
	protoDetails = newQSet.firstElementChild.cloneNode(true);
function moreWrong() {
	var li = this.parentNode.parentNode.previousElementSibling;
	li.parentNode.insertBefore(li.cloneNode(true), li.nextElementSibling);
	var input = li.nextElementSibling.firstChild;
	input.value = '';
	input.focus();
	input.onblur = inputRemove;
}
function bindListeners() {
	document.getElementById('new-qset-summary').addEventListener('click', function() {
		if (!this.parentNode.open) requestAnimationFrame(function() {
			document.getElementById('qset-title').focus();
		});
	});
	document.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	document.getElementById('more-questions').addEventListener('click', function() {
		var li = this.parentNode.parentNode;
		li.parentNode.insertBefore(protoLi.cloneNode(true), li);
		var newLi = li.previousElementSibling;
		newLi.getElementsByTagName('input')[0].addEventListener('blur', inputParentRemove);
		newLi.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
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
		for (var i = 2; i < ins.length; i++) question.incorrectAnswers.push(ins[i].value);
		questions.push(question);
	});
	request('/api/new-qset', function(res) {
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
				li.appendChild(document.createElement('p'));
				li.lastChild.appendChild(document.createTextNode('Answer: ' + question.answer));
				li.appendChild(document.createElement('p'));
				li.lastChild.appendChild(document.createTextNode('Wrong answers:'));
				var ul = document.createElement('ul');
				question.incorrectAnswers.forEach(function(answer) {
					ul.appendChild(document.createElement('li'));
					ul.lastChild.appendChild(document.createTextNode(answer));
				});
				li.appendChild(ul);
				details.lastChild.appendChild(li);
			});
			newQSet.parentNode.insertAfter(details, newQSet);
			newQSet.removeChild(newQSet.firstElementChild);
			newQSet.appendChild(protoDetails.cloneNode(true));
			bindListeners();
		}
	}, 'name=' + encodeURIComponent(document.getElementById('qset-title').value) + '&questions=' + encodeURIComponent(JSON.stringify(questions)));
});
