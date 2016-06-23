- teacher-client → server: new-game
  {"event": "new-game"}

- server: create a game
- server → teacher-client: game-code
  {"event": "new-game", "game-code": 123456}

- student-client → server: game-code + username
 {"event": "new-user", "game-code": 123456, "user": "bob"}

- server: add username to games object, verify game code
- server → student-client: game-code confirmed
{"event": "new-user"}

- client: update view with crew code entry (or error?)
- client → server: crew-code
{"event": "add-user-to-crew", "crew-code": 3}

- server: add user to crew-code, add crew if necessary
- server → teacher-client: user added to crew
{event: add-user-to-crew, crew-code: 3, user: lskdjflskdjf}

- teacher-client: add new username to crew

- teacher-client: click on user in a crew
- teacher-client: user moves from crew section to no-crew section
- teacher-client → server: remove user from crew
{event: remove-user-from-crew, crew-code: 3, user: sldkfjsldkjf}

- teacher-client: click on user not in crew
- teacher-client: user not in crew disappears from screen
- teacher-client → server: remove user from game
{event: remove-user-from-game, user: sldkfjsldkjf}

- teacher-client: click start game
- teacher-client → server: start game
{event: start-game}

- teacher-client: prepare map of each team

- server: prepare questions. randomly shuffle correct and incorrect answer queues. find their answers and insert them at the beginning of correct answer queues.

- server → student-client: full answer pool
{event: answers, correct-answers: [lskdjf, lskdjflkj, sldkdjflkj, slkdjlfkj], incorrect-answers: [lskdjf, lskdjflskdjf, lskdjflskdjf]}

- server → student-client: initial question
{event: question, question: lskdjflskdjflksdjf}

- student-client: initialize all variables for gameplay
- student-client → server: start-game
{event: start-game}

- server → student-client: begin-game
{event: start-game}

- server → teacher-client: start-game
{event: start-game}

- student-client → server: correct-answer
{event: correct-answer, question-user: username, answer-user: username, question: question, answer: answer, add-correct-answer: bool}
- server (if add-correct-answer): select random question and answer
- server (if not add-correct-answer): 