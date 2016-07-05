'use strict';
document.getElementById('new-qset-btn').addEventListener('click', function() {
	document.getElementById('new-qset').classList.remove('hide');
	document.getElementById('qset-title').focus();
});