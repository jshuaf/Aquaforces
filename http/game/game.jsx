let socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/');
const cont = document.getElementById('cont');
const errorEl = document.getElementById('error');
let gameHasEnded = false;
let answers = [];

let game;
let username;
let crewNumber;

function setState(id) {
	errorEl.textContent = '';
	cont.children.forEach((e) => {
		if (e.id !== id) {
			e.hidden = true;
		}
	});
	document.getElementById(id).hidden = false;
	// if filling out form, automatically focus
	// to the next input field
	var e = document.getElementById(id).getElementsByTagName('input');
	if (e.length) e[e.length - 1].focus();
}

function setupGameEnvironment() {
	document.getElementById('content').hidden = true;
	document.body.style =
		`background: #e3d393 url('/img/beach-background.png')
		repeat-x center top; background-size: cover;`;
}

socket.onmessage = function(m) {
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return alert('Socket error.');
	}

	switch (m.event) {
	case 'notice':
		errorEl.textContent = m.body;
		errorEl.scrollIntoView();
		break;
	case 'error':
		errorEl.textContent = m.body;
		errorEl.scrollIntoView();
		break;
	case 'addUser':
		setState('crew');
		break;
	case 'startGame':
		setState('mountNode');
		setupGameEnvironment();
		answers = m.answers;
		game = ReactDOM.render(<Game
  socket={socket} username={username}
  crewNumber={crewNumber} initialAnswers={m.answers}
  />,
			document.getElementById('mountNode'));
		break;
	case 'answerSelected':
		if (m.wasCorrectAnswer) {
			game.correctAnswer();
		} else {
			game.incorrectAnswer();
		}
		break;
	case 'correctAnswer':
		game.addCorrectAnswer(m.answer);
		break;
	case 'newQuestion':
		game.newQuestion(m.question);
		break;
	case 'endGame':
		gameHasEnded = true;
		break;
	default:
		console.log('Game recieved unknown event: ', m.event);
		break;
	}
};

socket.onclose = function() {
	errorEl.textContent = 'Socket closed.';
};
document.getElementById('join').addEventListener('submit', (e) => {
	e.preventDefault();
	socket.send(JSON.stringify({
		event: 'addUser',
		code: parseInt(document.getElementById('game-code').value, 10),
		name: document.getElementById('crewmember-name').value
	}));
	username = document.getElementById('crewmember-name').value;
});

document.getElementById('crew').addEventListener('submit', (e) => {
	e.preventDefault();
	socket.send(JSON.stringify({
		event: 'addUserToCrew',
		crewNumber: parseInt(document.getElementById('crewno').value, 10)
	}));
	document.getElementById('crewnodisplay').textContent =
		parseInt(document.getElementById('crewno').value, 10);
	crewNumber = parseInt(document.getElementById('crewno').value, 10);
});
