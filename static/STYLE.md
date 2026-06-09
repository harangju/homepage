# Paper pages

Self-contained interactive pages for individual papers. Each lives in
`static/<slug>/` and ships to Firebase at `/<slug>/`. The build copies
`static/.` into `build/`, so a folder here is served as-is. Static files
win over the SPA, so the React app never sees these paths.

## Make a new one

```
cp -R static/coordination static/<slug>
```

Then rewrite the content. `coordination/` is the worked example, not a
locked template. Keep what fits the paper, change what doesn't.

Add a link from the homepage in `src/App.tsx` with a plain anchor (full
page load, not the React `Link`):

```jsx
<a href="/<slug>/" className="link">title</a>
```

## What's shared vs. yours

Shared, do not redefine per page:

- `/_shared/base.css` — palette tokens, type tokens, resets, base `body`
  and `a`. Linked first in the `<head>`, before the page's `styles.css`.
- The writing voice (below).

Yours, free to diverge:

- `styles.css` — all layout, sections, components, animations styling.
- `script.js` — visualizations and interaction.
- Section structure. The coordination page runs hero → idea → explorer →
  sim → evidence → cite, because that paper needed those. Use what the
  paper's story needs.

## Palette tokens (from base.css)

- `--cream / --cream-2 / --cream-3` — backgrounds. `--cream` matches the
  homepage. `-2` / `-3` are alternating band shades.
- `--paper` — white cards.
- `--ink / --ink-soft / --ink-mute / --ink-dim` — text, darkest to faintest.
- `--rule / --rule-soft` — borders.
- `--mono` (green), `--order` (amber), `--nm` (red) plus `*-soft` fills —
  semantic accents. Reuse the meaning, not just the color.
- `--accent` (indigo) — links and chrome.
- `--serif / --sans / --code` — type.

## Head boilerplate

Every page needs the font `<link>` and the two stylesheet links, in order:

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/_shared/base.css" />
<link rel="stylesheet" href="styles.css" />
```

## Writing voice

Same as the papers (`paper/STYLE.md` in the research repo):

- No em dashes. Use a comma, period, or parentheses.
- No explanatory colons in prose. Split into two sentences.
- De-hedge. State the claim.
- Short subjects, active voice, precise verbs.

## Gotchas

- Asset links to shared files are absolute from the web root
  (`/_shared/base.css`), not `../`.
- No `../` links to anything outside `static/`. They break at this depth.
  Point the Paper chip at the public URL (arXiv, journal, PDF host).
- Test with `bun run build && bun run serve`, then open `/<slug>/`.
  `bun --hot src/index.html` only serves the React app, not `static/`.
