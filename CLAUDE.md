# Pin High — daily trivia golf

Live site: https://pinhighgame.netlify.app (Netlify auto-deploys every push to `main`).
Owner: Felix. The game is one static page; `index.html` is BUILT from `src/` — never edit `index.html` by hand.

## Layout
- `src/head.html`, `src/body.html` — page, styles and game logic (`/*DATA*/` is replaced by the data files).
- `src/masters.js` — countries, elements, US states. Many prompts are generated from these.
- `src/rare.js` — hand-written rare-find prompts: `["id","Prompt","Answer A|alias;Answer B;...","MM-DD"(optional theme date)]`.
  Answers go from MOST to LEAST commonly given — position sets the shot count (first ~12% = 5 shots, last ~15% = hole in one).
- `src/pins.js` — closest-to-the-pin questions: `["Question", answer, "unit", kind]`, kind `"y"` year, `"c"` whole count,
  `"r"` measurement (relative error) or a 6-number band array. Pin ids are `pin<index>`, so **only ever append to the end of PINS**;
  fix a wrong question in place, never delete or reorder.
- `src/schedule.js` — fixed calendar: date → 9 prompt ids in hole order R P R R P R R P R.
- `build.py` — builds `index.html` (and `.build/game.js` for the tools).
- `tools/extend_schedule.js` — rebuilds the calendar from 2+ days ahead, preferring never-used questions.
- `tools/check.js` — validation; must pass before any push.

## Hard rules
- NEVER change today's or tomorrow's course (UK time) or any past date in `src/schedule.js`. Players share results by course number.
- Prompt ids must be unique and stable. Don't rename or delete existing prompts; you can fix answers.
- Facts must be stable and verifiable. No "current holder" questions (current champion, PM, record that may fall) unless
  phrased with a fixed date range ("between 2000 and 2025"). If unsure of a fact, leave it out.
- Rare-find answer lists must be COMPLETE for the category — a valid answer that isn't listed scores as a lost ball.
  Prefer closed sets (all X of Y). At least 6 answers; aim for 10+.
- British audience: UK spelling, include UK-relevant aliases.

## Daily routine (scheduled job)
1. `python3 build.py && node tools/check.js` — confirm the repo is healthy first.
2. Write new content: append 2 new rare-find prompts to `HAND` in `src/rare.js` and 3 new questions to the end of `PINS` in
   `src/pins.js`. Read both files first so nothing duplicates an existing prompt or question. Use new unique ids. Assign a
   family where it clearly overlaps an existing group (see `famOf` in `src/body.html`).
3. `python3 build.py && node tools/extend_schedule.js --ahead 60 && python3 build.py && node tools/check.js`
4. Only if checks pass: commit ("Daily questions YYYY-MM-DD: ...") and `git push origin main`. If anything fails, push nothing.
