# Repository guidelines: Matrix Rain Dashboard

This project serves a small web dashboard with a Matrix-style "digital rain" animation and movable frames.  The front-end lives in `index.html`, `style.css`, and `script.js`.  A tiny Express server in `server.js` handles persistence via `frames.json`.

## Running the site
1. `npm install` – install dependencies (only Express).
2. `npm start` – start `server.js` on <http://localhost:3000>.

There are no automated tests.  Manual testing is done by loading the page in a browser and interacting with frames.

## Coding style
- Use **four spaces** for HTML/CSS/front-end JS (`index.html`, `style.css`, `script.js`).
- Use **two spaces** in Node code (`server.js`).
- Keep code ES6 compatible and include semicolons.

## File rules
- `frames.json` contains runtime data and should not be modified or committed.

## PR guidelines
- Summarize the user-facing changes and how you manually tested them.
- Mention that the project has no tests.
