import React from 'react';
import reactDOM from 'react-dom';
import GameHost from './host_components.jsx';

var socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
var cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');

var crews = {};
var usersWithoutCrews = [];

let gameHost;

function setState(id) {
	// hide and show different elements
	errorEl.textContent = '';
	cont.children.forEach(function(e) {
		if (e.id != id) e.hidden = true;
	});
	document.getElementById(id).hidden = false;
}

function removeUserFromGame() {
	const userToRemove = this.dataset.username;
	socket.send(JSON.stringify({
		event: 'remove-user',
		user: userToRemove
	}));
	this.parentNode.removeChild(this);

	for (var i = 0; i < usersWithoutCrews.length; i++) {
		const username = usersWithoutCrews[i];
		if (userToRemove == username) {
			usersWithoutCrews.remove(username);
			break;
		}
	}
}

function removeUserFromCrew() {
	socket.send(JSON.stringify({
		event: 'remove-user-from-crew',
		user: this.dataset.username
	}));
	var li = document.createElement('li');
	li.dataset.username = this.dataset.username;
	li.appendChild(document.createTextNode(this.dataset.username));
	li.onclick = removeUserFromGame;
	document.getElementById('loneusers').appendChild(li);
	this.parentNode.dataset.n--;
	this.parentNode.removeChild(this);

	crews.forEach(crewNumber, function() {
		let crewmembers = crews.crewNumber.users;
		crewmembers.forEach(crewmember, function() {
			if (crewmember == this.dataset.username) {
				crewmembers.remove(crewmember);
				return;
			}
		});
	});
}

socket.onmessage = function(message) {
	console.log(message.data);
	try {
		message = JSON.parse(message.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}
	switch (message.event) {
	case 'notice':
		alert(message.body);
		break;
	case 'error':
		alert(message.body);
		setState(message.state);
		errorEl.textContent = message.body;
		break;
	case 'newGame':
		document.getElementById('game-code-cont').appendChild(document.createTextNode(message.id));
		break;
	case 'addNewUser':
		var li = document.createElement('li');
		li.dataset.username = message.user;
		li.appendChild(document.createTextNode(message.user));
		li.onclick = removeUserFromGame;
		document.getElementById('loneusers').appendChild(li);
		usersWithoutCrews.push(message.user);
		break;
	case 'addUserToCrew':
		document.getElementById('loneusers').childNodes.forEach(function(e) {
			if (e.firstChild.nodeValue == message.user) e.parentNode.removeChild(e);
		});
		let sign = document.createElement('span');
		sign.appendChild(document.createTextNode('<'));
		var span = document.createElement('span');
		span.dataset.username = message.user;
		span.className = 'clickable';
		span.appendChild(sign);
		span.appendChild(document.createTextNode(message.user));
		span.onclick = removeUserFromCrew;
		document.getElementById('crews').children[message.crew - 1].appendChild(span);
		document.getElementById('crews').children[message.crew - 1].dataset.n++;
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		console.log(crews);
		if (message.crew in crews) {
			crews[message.crew].users.push(message.user);
		} else {
			crews[message.crew] = {
				name: 'Crew ' + (message.crew).toString(),
				users: [message.user],
				position: 0,
				status: 'rowing',
				boat: 'canoe'
			};
		}
		break;
	case 'removeUser':
		var e = document.querySelector('[data-username=' + JSON.stringify(message.user) + ']');
		if (e) {
			e.parentNode.removeChild(e);
			// if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
		}
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		break;
	case 'updateCrewPosition':
		gameHost.updateCrewPosition(message.crewNumber, message.increment);
	}
};

socket.onclose = function() {
	errorEl.textContent = 'Socket closed.';
};
document.getElementById('dashboard').addEventListener('submit', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'newGame'}));
	setState('tgame');
});

document.getElementById('start-game-btn').addEventListener('click', function(e) {
	e.preventDefault();
	socket.send(JSON.stringify({event: 'startGame'}));
	document.getElementById('cont').hidden = true;
	setState('mountNode');
	console.log(crews);
	gameHost = reactDOM.render(<GameHost initialCrews={crews} />, document.getElementById('mountNode'));
});
