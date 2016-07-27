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
		var li = this.parentNode;
		if (li.nextElementSibling.nextElementSibling) li.nextElementSibling.lastChild.focus();
		else setupMoreWrong(li);
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
			details.appendChild(document.createElement('ol'));
			questions.forEach(function(question) {
				details.lastChild.appendChild(buildQuestion(question));
				details.lastChild.appendChild(buildQuestionEditor(question));
			});
			details.apendChild(document.createElement('a'));
			details.lastChild.className = 'new-question';
			details.lastChild.appendChild(document.createTextNode('add question'));
			newQSet.parentNode.insertAfter(details, newQSet);
			newQSet.removeChild(newQSet.firstElementChild);
			newQSet.appendChild(protoDetails.cloneNode(true));
			bindListeners();
		}
	}, 'name=' + encodeURIComponent(document.getElementById('qset-title').value) + '&questions=' + encodeURIComponent(JSON.stringify(questions)));
});
var target = document.querySelector('details:target');
if (target) target.setAttribute('open', true);