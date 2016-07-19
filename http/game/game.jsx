let socket = new WebSocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname + (location.port != 80 ? ':' + location.port : '') + '/play/');
const cont = document.getElementById('cont');
let gameHasEnded = false;
let answers = [];

let game;
let username;
let crewNumber;

function setState(id) {
	cont.children.forEach((e) => {
		if (e.id !== id) {
			e.hidden = true;
		}
	});
	document.getElementById(id).hidden = false;
	// if filling out form, automatically focus
	// to the next input field
	var e = document.getElementById(id).getElementsByTagName('input');
	if (e.length) e[0].focus();
}

function setupGameEnvironment() {
	document.getElementById('content').hidden = true;
	document.body.style.cssText =
		`background: #32c0cf repeat-x center top; background-size: cover;`;
}

function confirmMessageRecieved() {
	socket.send(JSON.stringify({event: 'messageRecieved'}));
}

socket.onmessage = function(m) {
	try {
		m = JSON.parse(m.data);
	} catch (e) {
		console.log(e);
		return sweetAlert('Socket error.');
	}

	confirmMessageRecieved();

	switch (m.event) {
	case 'ping':
		break;
	case 'notice':
		errorEl.textContent = m.body;
		errorEl.scrollIntoView();
		break;
	case 'error':
		sweetAlert(m.title, m.text, "error");
		break;
	case 'addUser':
		setState('crew');
		break;
	case 'addUserToCrew':
		document.getElementById('crewnodisplay').textContent =
			parseInt(document.getElementById('crewno').value, 10);
		crewNumber = parseInt(document.getElementById('crewno').value, 10);
		setState('wait');
		break;
	case 'removeUserFromCrew':
		setState('crew');
		break;
	case 'removeUserFromGame':
		setState('join');
		break;
	case 'startGame':
		setState('mountNode');
		setupGameEnvironment();
		answers = m.answers;
		game = ReactDOM.render(<Game
  socket={socket} username={username}
  crewNumber={crewNumber} initialAnswers={m.answers}
	crewSize={m.crewSize}
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
	case 'updateHP':
		game.updateHP(m.hp);
		break;
	case 'addRock':
		game.addRock(m.startTime);
		break;
	case 'endRock':
		game.endRock();
		break;
	case 'whirlpoolAhead':
		game.addWhirlpoolTap();
		break;
	case 'whirlpoolQuestion':
		game.addWhirlpoolQuestion(m.question);
		break;
	case 'whirlpoolBonusReceived':
		console.log('Bonus received');
		game.setState({whirlpoolBonus: m.amount});
		break;
	case 'whirlpoolConclusion':
		game.setState({whirlpool: false});
		game.state.whirlpoolTimebar.reset();
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

socket.onclose = () => {
	sweetAlert("Server connection died.", "We're sorry about that.", "error");
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
});
