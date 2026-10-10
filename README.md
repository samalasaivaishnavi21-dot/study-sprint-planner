# Study Sprint Planner

A simple, responsive study planner built with plain HTML, CSS, and JavaScript. Add study tasks, mark them complete, delete them, and see your progress at a glance.

## Features

- Add a task by entering its name.
- Mark tasks complete or reopen them.
- Delete tasks from the list.
- See total and completed task counts, with a progress bar.
- Keep tasks saved in the current browser with `localStorage`.
- Use the responsive interface on desktop and mobile.

## Run locally

No packages, build step, or external libraries are required. From this directory, start a local static server:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a browser.

## Files

- `index.html` — page structure and accessible task controls.
- `style.css` — responsive cream-and-green styling.
- `script.js` — task interactions, counts, and browser storage.
- `favicon.svg` — small leaf mark used by the page.

Tasks are stored only in the browser where they were created; they are not synced between devices.
