'use strict';
document.getElementById('new-qset-btn').addEventListener('click', function() {
	document.getElementById('new-qset').classList.remove('hide');
	document.getElementById('qset-title').focus();
});
function inputRemove() {
	if (!this.value) this.parentNode.parentNode.removeChild(this.parentNode);
}
function inputParentRemove() {
	if (!this.value) this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
}
var protoLi = document.getElementById('questions').firstElementChild.cloneNode(true);
function moreWrong() {
	var li = this.parentNode.parentNode.previousElementSibling;
	li.parentNode.insertBefore(li.cloneNode(true), li.nextElementSibling);
	var input = li.nextElementSibling.firstChild;
	input.value = '';
	input.focus();
	input.onblur = inputRemove;
}
document.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
document.getElementById('more-questions').addEventListener('click', function() {
	var li = this.parentNode.parentNode;
	li.parentNode.insertBefore(protoLi.cloneNode(true), li);
	var newLi = li.previousElementSibling;
	newLi.getElementsByTagName('input')[0].addEventListener('blur', inputParentRemove);
	newLi.getElementsByClassName('more-wrong')[0].addEventListener('click', moreWrong);
	newLi.getElementsByTagName('input')[0].focus();
});
document.getElementById('new-qset').addEventListener('submit', function(e) {
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
	console.log(questions);
});