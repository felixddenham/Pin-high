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
- Typo matching (`matchRare` in `src/body.html`) is deliberately forgiving: ~1 typo per 3–4 letters, swapped letters,
  spaces and plurals ignored, with a "did you mean" check. Felix wants near-miss spellings accepted; don't tighten it.

## Difficulty: Krillion-style (most important)
Every prompt must be something ANY adult can answer: they should be able to name 2–3 answers instantly
(e.g. "Name a fruit", "Name a dog breed", "Name a takeaway dish", "Name a country in Europe").
The skill is in going niche: obvious answers are a bogey, obscure-but-correct ones are birdies and eagles.
- Felix wants Krillion-sized lists: the best prompts have HUNDREDS to THOUSANDS of valid answers, where the obvious ones
  are a double bogey and niche-but-correct ones score well. New hand-written prompts need at least 150 answers (aim 200+),
  so they use the log-scale scoring for long lists (`rareShots` in `src/body.html`). Don't add new closed sets under 40 answers;
  Felix asked for those to be retired once enough big prompts exist to fill the schedule.
- Open-ended prompts ("Name a superhero", "Name a UK chocolate bar") must be GENEROUS: include sub-brands and variants (Wispa Gold,
  Dairy Milk Marvellous Creations), discontinued-but-remembered items, and children's/cartoon examples (Captain Underpants).
  Felix reports any valid answer that scores as a lost ball. When in doubt, accept it (append near the end of the list).
- Avoid specialist categories most people can't start (sports champions lists, literary bibliographies, SI units,
  cloud types, specific mountains). If a typical person would say "no idea", don't use it.
- Closest-to-the-pin questions should be fun to estimate for anyone (famous years, everyday numbers, well-known
  heights/distances), not specialist facts. Felix flagged snooker champions, Brontë novels and Scafell Pike as too niche.
- Retire a prompt that turns out too niche by adding its id to `RETIRED` at the bottom of `src/rare.js` (never delete it).

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
2. Write new content (Krillion-style difficulty, see above): append 2 new rare-find prompts to `HAND` in `src/rare.js` and 3 new questions to the end of `PINS` in
   `src/pins.js`. Read both files first so nothing duplicates an existing prompt or question. Use new unique ids. Assign a
   family where it clearly overlaps an existing group (see `famOf` in `src/body.html`).
3. `python3 build.py && node tools/extend_schedule.js --ahead 60 && python3 build.py && node tools/check.js`
4. Only if checks pass: commit ("Daily questions YYYY-MM-DD: ...") and `git push origin main`. If anything fails, push nothing.
