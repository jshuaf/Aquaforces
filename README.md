# Aquaforces

A collaborative learning game.

## Errors

- {"event": "error", "body": "this happened."}

## Server and Client Protocol

- teacher-client -> server: new-game
  {"event": "new-game"}

- server: create a game
- server -> teacher-client: game-code
  {"event": "new-game", "game-code": 123456}

- student-client -> server: game-code + user-name
 {"event": "new-user", "game-code": 123456, "user-name": "bob"}

- server: add username to games object, verify game code
- server -> student-client: game-code confirmed
{"event": "new-user"}

- client: update view with crew code entry (or error?)
- client -> server: crew-code
{"event": "add-user-to-crew", "crew-code": 3}

- server: add user to crew-code, add crew if necessary
- server -> teacher-client:

- teacher-client:
- server ->

message.state
message.event
message.body
message.
