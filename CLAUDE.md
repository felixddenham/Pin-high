# Pin High — daily golf trivia

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
- Typo matching (`matchRare` in `src/body.html`) is deliberately forgiving: ~1 typo per 3–4 letters, swapped letters,
  spaces and plurals ignored, with a "did you mean" check. Felix wants near-miss spellings accepted; don't tighten it.

## GOLF ONLY (from 2026-11-15) — most important
Felix made Pin High a golf-only trivia game (its USP). Every NEW prompt and pin must be about golf: courses (UK and world),
players, tournaments, Ryder Cup, clubs and stock lofts/yardages, equipment brands and models, rules, terms, slang, formats.
The audience is golfers, so golf knowledge is fine — but a keen club golfer should still be able to name 2–3 answers instantly.
- `GOLF_ONLY` in `src/body.html` limits scheduling to rare prompts whose family starts `golf-` (set in `GOLF_FAM` in `src/rare.js`)
  and pins whose 5th field is `"g"`. Old general-knowledge content stays in the files so past courses still load.
- Give each new golf prompt an id starting `g-` and add it to `GOLF_FAM` with an existing sub-family (golf-players, golf-champs,
  golf-ryder, golf-uk-courses, golf-courses, golf-events, golf-kit, golf-clubs, golf-terms, golf-play) or a new `golf-...` one.
  New pins: `["Question", answer, "unit", kind, "g"]`.
- Krillion-sized lists: new prompts need at least 150 answers (aim 200+); obvious answers score badly, niche-but-correct ones well.
  Closed lists (champions, Ryder Cup teams) must be COMPLETE for a stated date range and at least 40 answers.
- Open-ended prompts must be GENEROUS: sub-brands, variants, old models, nicknames and aliases. Felix reports any valid answer
  that scores as a lost ball. When in doubt, accept it (append near the end of the list).
- Stock yardages / lofts vary, so phrase them "typically/roughly" and use generous band arrays.
- Retire a prompt that turns out bad by adding its id to `RETIRED` at the bottom of `src/rare.js` (never delete it).

## Hard rules
- NEVER change today's or tomorrow's course (UK time) or any past date in `src/schedule.js`. Players share results by course number.
- Prompt ids must be unique and stable. Don't rename or delete existing prompts; you can fix answers.
- Facts must be stable and verifiable. No "current holder" questions (current champion, PM, record that may fall) unless
  phrased with a fixed date range ("between 2000 and 2025"). If unsure of a fact, leave it out.
- Rare-find answer lists must be COMPLETE for the category — a valid answer that isn't listed scores as a lost ball.
  Prefer big categories that can be listed fully or generated from data (see above).
- British audience: UK spelling, include UK-relevant aliases.

## Daily routine (scheduled job)
1. `python3 build.py && node tools/check.js` — confirm the repo is healthy first.
2. Write new GOLF content (see GOLF ONLY above): append 2 new golf rare-find prompts to `HAND` in `src/rare.js` (plus their `GOLF_FAM` entries) and 3 new golf questions (5th field `"g"`) to the end of `PINS` in
   `src/pins.js`. Read both files first so nothing duplicates an existing prompt or question. Use new unique ids. Assign a
   family where it clearly overlaps an existing group (see `famOf` in `src/body.html`).
3. `python3 build.py && node tools/extend_schedule.js --ahead 60 && python3 build.py && node tools/check.js`
4. Only if checks pass: commit ("Daily questions YYYY-MM-DD: ...") and `git push origin main`. If anything fails, push nothing.
