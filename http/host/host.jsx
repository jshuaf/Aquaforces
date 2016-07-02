import React from 'react';
import reactDOM from 'react-dom';
import GameHost from './host_components.jsx';

const socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/host/');
const cont = document.getElementById('cont'),
	errorEl = document.getElementById('error');

const crews = {};
const usersWithoutCrews = [];

let gameHost;
let gameHasStarted = false;

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
		event: 'removeUser',
		user: userToRemove
	}));
	this.parentNode.removeChild(this);

	for (let i = 0; i < usersWithoutCrews.length; i++) {
		const username = usersWithoutCrews[i];
		if (userToRemove == username) {
			usersWithoutCrews.remove(username);
			break;
		}
	}
}

function removeUserFromCrew() {
	if (gameHasStarted) {
		return;
	}
	socket.send(JSON.stringify({
		event: 'removeUserFromCrew',
		user: this.dataset.username
	}));
	let li = document.createElement('li');
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

socket.onmessage = function(m) {
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}
	switch (m.event) {
	case 'error':
		alert(m.body);
		setState(m.state);
		errorEl.textContent = m.body;
		break;
	case 'newGame':
		document.getElementById('game-code-cont').appendChild(document.createTextNode(m.id));
		break;
	case 'addNewUser':
		let li = document.createElement('li');
		li.dataset.username = m.user;
		li.appendChild(document.createTextNode(m.user));
		li.onclick = removeUserFromGame;
		document.getElementById('loneusers').appendChild(li);
		usersWithoutCrews.push(m.user);
		break;
	case 'addUserToCrew':
		document.getElementById('loneusers').childNodes.forEach(function(e) {
			if (e.firstChild.nodeValue == m.user) e.parentNode.removeChild(e);
		});
		let sign = document.createElement('span');
		sign.appendChild(document.createTextNode('<'));
		let span = document.createElement('span');
		span.dataset.username = m.user;
		span.className = 'clickable';
		span.onclick = removeUserFromCrew;
		document.getElementById('crews').children[m.crew - 1].appendChild(span);
		document.getElementById('crews').children[m.crew - 1].dataset.n++;
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		if (m.crew in crews) {
			crews[m.crew].users.push(m.user);
		} else {
			crews[m.crew] = {
				name: 'Crew ' + (m.crew).toString(),
				users: [m.user],
				position: 0,
				status: 'rowing',
				boat: 'canoe'
			};
		}
		break;
	case 'answerSelected':
		gameHost.answerSelected(m.wasCorrectAnswer, m.crewNumber);
		break;
	case 'removeUser':
		let e = document.querySelector('[data-username=' + JSON.stringify(m.user) + ']');
		if (e) {
			e.parentNode.removeChild(e);
			// if (e.parentNode.dataset.n) e.parentNode.dataset.n--;
		}
		document.getElementById('start-game-btn').disabled = document.getElementById('loneusers').childNodes.length != 0 || document.querySelector('li[data-n=\'1\']');
		break;
	case 'updateCrewPosition':
		gameHost.updateCrewPosition(m.crewNumber, m.increment);
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
	socket.send(JSON.stringify({
		event: 'startGame'
	}));
	// MARK: figure out our html
	document.getElementById('cont').hidden = true;
	setState('mountNode');
	gameHasStarted = true;
	gameHost = reactDOM.render(<GameHost initialCrews={crews} />, document.getElementById('mountNode'));
});
function endGame() {
    socket.send(JSON.stringify({
        event: 'endGame'
    }));
}
