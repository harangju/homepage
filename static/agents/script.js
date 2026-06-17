/* ===========================================================
   Personality Pairing in Human-AI Teams — interactions
   Hand-rolled SVG + DOM. No dependencies.

   Effects encode the DIRECTION and SIGNIFICANCE of reported
   pairing effects on ad quality (manuscript Figs. 2-3), not
   raw coefficients. e: +2/+1 raise quality, -1/-2 lower it,
   0 = not individually significant. NN carries the field
   click-through result, a different outcome.
   =========================================================== */
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const C = {
  mono: '#2e7d32', monoSoft: '#cfe6d0',
  nm:   '#c0392b', nmSoft: '#f3d2cd',
  ink:  '#1b1a17', mute: '#6b6759', dim: '#94907f',
  rule: '#ddd8c9', cream3: '#e8e8e3', paper: '#ffffff', accent: '#3a3a8c',
  order: '#b8860b'
};

function svg(tag, attrs = {}) { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
function el(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
function txt(node, s) { node.textContent = s; return node; }
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

/* scroll-scrubbed animation. Each figure registers a draw(p) that
   renders the figure AT progress p (0..1). p comes from the figure's
   position in the viewport, so motion tracks the scrollbar exactly:
   forward as you scroll down, backward as you scroll up, frozen when
   you stop. No timers, no transitions. */
const _scrub = [];
function scrub(el, draw) { if (el) _scrub.push({ el, draw, cur: 0, target: 0 }); }
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (p) => 1 - Math.pow(1 - p, 3);
const lerp = (a, b, p) => a + (b - a) * p;
function hexLerp(a, b, p) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((A >> 16) & 255, (B >> 16) & 255, p));
  const g = Math.round(lerp((A >> 8) & 255, (B >> 8) & 255, p));
  const bl = Math.round(lerp(A & 255, B & 255, p));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function _progress(el) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Scrub the figure's top across most of the viewport: begins just
  // after it clears the bottom edge and finishes near the top. The
  // long span keeps motion gradual and means a figure is always
  // partway animated while it's on screen, never sitting blank.
  const START = 0.92, END = 0.12;
  return clamp01((START * vh - r.top) / ((START - END) * vh));
}
// scroll sets each figure's target; a rAF loop eases the rendered
// value toward it, so chunky mouse-wheel steps glide instead of snap.
// The loop sleeps once everything has settled.
let _raf = null;
function _frame() {
  let moving = false;
  for (const s of _scrub) {
    const d = s.target - s.cur;
    if (Math.abs(d) > 0.0006) { s.cur += d * 0.16; moving = true; }
    else s.cur = s.target;
    s.draw(s.cur);
  }
  _raf = moving ? requestAnimationFrame(_frame) : null;
}
function _measure() {
  for (const s of _scrub) s.target = _progress(s.el);
  if (_raf == null) _raf = requestAnimationFrame(_frame);
}
function setupScrub() {
  if (prefersReduced) { _scrub.forEach((s) => s.draw(1)); return; }
  window.addEventListener('scroll', _measure, { passive: true });
  window.addEventListener('resize', _measure);
  _scrub.forEach((s) => { s.target = s.cur = _progress(s.el); s.draw(s.cur); });
}


/* ===========================================================
   HERO — the headline finding. One team, partner cycles between
   AI and human; three meters (productivity, text, image) swap to
   the real condition means, dramatizing the jagged frontier.
   Bar lengths are the real means from manuscript Table 2,
   normalized for display.
   =========================================================== */
function buildHero() {
  const root = $('#heroSvg'); if (!root) return; clear(root);
  const d = (ms) => prefersReduced ? 0 : ms;

  // team tile (left)
  const tx = 56, tw = 184, ty = 92, th = 124;
  root.appendChild(svg('rect', { x: tx, y: ty, width: tw, height: th, rx: 14, fill: C.paper, stroke: C.rule, 'stroke-width': 1.5 }));
  txt(root.appendChild(svg('text', { x: tx + tw / 2, y: ty - 12, 'text-anchor': 'middle', fill: C.dim, 'font-size': 11, 'font-weight': 600, 'letter-spacing': '0.08em', 'font-family': 'JetBrains Mono, monospace' })), 'THE TEAM');
  txt(root.appendChild(svg('text', { x: tx + tw / 2, y: ty + 46, 'text-anchor': 'middle', fill: C.ink, 'font-size': 23, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), 'Human');
  txt(root.appendChild(svg('text', { x: tx + tw / 2, y: ty + 76, 'text-anchor': 'middle', fill: C.dim, 'font-size': 18, 'font-family': 'Inter, sans-serif' })), '+');
  const partner = svg('text', { x: tx + tw / 2, y: ty + 106, 'text-anchor': 'middle', fill: C.mono, 'font-size': 23, 'font-weight': 700, 'font-family': 'Inter, sans-serif' });
  partner.style.transition = 'fill .4s ease'; root.appendChild(partner);

  txt(root.appendChild(svg('text', { x: tx + tw + 28, y: 160, 'text-anchor': 'middle', fill: C.dim, 'font-size': 28, 'font-family': 'Inter, sans-serif' })), '→');

  // three meters (right)
  const x0 = 322, maxW = 348, ys = [98, 152, 206], LABS = ['Ads per worker', 'Text quality', 'Image quality'];
  const fills = [];
  LABS.forEach((lab, i) => {
    const y = ys[i];
    txt(root.appendChild(svg('text', { x: x0, y: y - 9, fill: C.mute, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), lab);
    root.appendChild(svg('rect', { x: x0, y, width: maxW, height: 16, rx: 8, fill: C.cream3 }));
    const f = svg('rect', { x: x0, y, width: 0, height: 16, rx: 8, fill: C.mono });
    f.style.transition = 'width .7s cubic-bezier(.4,0,.2,1), fill .4s ease';
    root.appendChild(f); fills.push(f);
  });
  const cap = svg('text', { x: 360, y: 268, 'text-anchor': 'middle', fill: C.mute, 'font-size': 18, 'font-weight': 600, 'font-family': 'Inter, sans-serif' });
  cap.style.transition = 'opacity .3s ease'; root.appendChild(cap);

  const STATES = [
    { name: 'AI agent', col: C.mono, v: [0.94, 0.87, 0.19], cap: 'With AI: more ads, stronger text, weaker images' },
    { name: 'human',    col: C.nm,   v: [0.62, 0.59, 0.31], cap: 'With a human: fewer ads, stronger images' },
  ];
  let s = 0;
  function show() {
    const st = STATES[s];
    txt(partner, st.name); partner.setAttribute('fill', st.col);
    fills.forEach((f, i) => { f.setAttribute('fill', st.col); f.setAttribute('width', st.v[i] * maxW); });
    cap.setAttribute('opacity', 0);
    setTimeout(() => { txt(cap, st.cap); cap.setAttribute('opacity', 1); }, d(260));
    s = (s + 1) % STATES.length;
  }
  show();
  if (!prefersReduced) setInterval(show, 3800);
}

/* ===========================================================
   RANDOMIZATION — 2,234 people flow through a random gate and
   split into human-AI and human-human teams.
   =========================================================== */
function buildRandomize() {
  const root = $('#randomFig'); if (!root) return; clear(root);

  const cnt = svg('text', { x: 108, y: 46, 'text-anchor': 'middle', fill: C.accent, 'font-size': 30, 'font-weight': 700, 'font-family': 'Newsreader, serif' });
  cnt.setAttribute('data-to', '2234'); txt(cnt, '0'); root.appendChild(cnt);
  txt(root.appendChild(svg('text', { x: 108, y: 64, 'text-anchor': 'middle', fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' })), 'people');

  txt(root.appendChild(svg('text', { x: 300, y: 28, 'text-anchor': 'middle', fill: C.dim, 'font-size': 11, 'font-weight': 600, 'letter-spacing': '0.08em', 'font-family': 'JetBrains Mono, monospace' })), 'RANDOM ASSIGNMENT');
  root.appendChild(svg('line', { x1: 300, y1: 76, x2: 300, y2: 244, stroke: C.rule, 'stroke-width': 1.5, 'stroke-dasharray': '3 5' }));

  [{ lab: 'Human–AI team', col: C.mono, soft: C.monoSoft, boxY: 102 },
   { lab: 'Human–Human team', col: C.nm, soft: C.nmSoft, boxY: 196 }].forEach((t) => {
    txt(root.appendChild(svg('text', { x: 434, y: t.boxY - 9, fill: t.col, 'font-size': 14, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), t.lab);
    root.appendChild(svg('rect', { x: 432, y: t.boxY, width: 258, height: 64, rx: 11, fill: t.soft, 'fill-opacity': 0.4, stroke: t.col, 'stroke-width': 1.2 }));
  });

  const dots = [], cols = 8, rows = 6;
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols, row = (i / cols) | 0;
    const bx = 52 + col * 16, by = 88 + row * 26;
    const grp = Math.random() < 0.5 ? 0 : 1;
    const tx = 448 + Math.random() * 224, ty = (grp ? 196 : 102) + 16 + Math.random() * 32;
    const c = svg('circle', { cx: bx, cy: by, r: 4, fill: C.dim, 'fill-opacity': 0.85 });
    root.appendChild(c);
    dots.push({ c, dx: tx - bx, dy: ty - by, col: grp ? C.nm : C.mono, delay: i / (cols * rows) });
  }
  scrub(root, (p) => dots.forEach((d) => {
    const lp = ease(clamp01((p - d.delay * 0.35) / 0.65));
    d.c.style.transform = `translate(${d.dx * lp}px, ${d.dy * lp}px)`;
    d.c.setAttribute('fill', hexLerp(C.dim, d.col, lp));
  }));
}

/* ===========================================================
   EVALUATION — every ad graded two ways: human raters and a
   live field experiment on X.
   =========================================================== */
function buildEvaluate() {
  const root = $('#evalFig'); if (!root) return; clear(root);

  // left: a small stack of ads
  [{ x: 40, y: 100 }, { x: 52, y: 88 }, { x: 64, y: 76 }].forEach((s, i, arr) => {
    root.appendChild(svg('rect', { x: s.x, y: s.y, width: 92, height: 108, rx: 8, fill: C.paper, stroke: C.rule, 'stroke-width': 1.2 }));
    if (i === arr.length - 1) {
      root.appendChild(svg('rect', { x: s.x + 12, y: s.y + 12, width: 68, height: 38, rx: 4, fill: C.order, 'fill-opacity': 0.45 }));
      [0, 1, 2].forEach((k) => root.appendChild(svg('rect', { x: s.x + 12, y: s.y + 60 + k * 12, width: k === 2 ? 40 : 68, height: 6, rx: 3, fill: C.cream3 })));
    }
  });
  txt(root.appendChild(svg('text', { x: 100, y: 232, 'text-anchor': 'middle', fill: C.mute, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), 'every ad');

  const arrow = (y2) => {
    root.appendChild(svg('path', { d: `M 160 138 C 214 138, 238 ${y2}, 300 ${y2}`, fill: 'none', stroke: C.mute, 'stroke-width': 2 }));
    root.appendChild(svg('path', { d: `M 292 ${y2 - 5} L 303 ${y2} L 292 ${y2 + 5} Z`, fill: C.mute }));
  };
  arrow(104); arrow(210);

  // card A: human raters
  root.appendChild(svg('rect', { x: 312, y: 68, width: 384, height: 78, rx: 12, fill: C.paper, stroke: C.rule, 'stroke-width': 1.2 }));
  const ra = svg('text', { x: 332, y: 116, fill: C.accent, 'font-size': 30, 'font-weight': 700, 'font-family': 'Newsreader, serif' });
  ra.setAttribute('data-to', '1168'); txt(ra, '0'); root.appendChild(ra);
  txt(root.appendChild(svg('text', { x: 332, y: 134, fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' })), 'independent human raters of quality');
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const st = svg('text', { x: 598 + i * 18, y: 116, 'text-anchor': 'middle', fill: C.rule, 'font-size': 20, 'font-family': 'Inter, sans-serif' });
    txt(st, '★'); root.appendChild(st); stars.push(st);
  }

  // card B: field on X
  root.appendChild(svg('rect', { x: 312, y: 160, width: 384, height: 78, rx: 12, fill: C.paper, stroke: C.rule, 'stroke-width': 1.2 }));
  txt(root.appendChild(svg('text', { x: 332, y: 206, fill: C.mono, 'font-size': 28, 'font-weight': 700, 'font-family': 'Newsreader, serif' })), '≈5M');
  txt(root.appendChild(svg('text', { x: 332, y: 224, fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' })), 'impressions in a field experiment on X');
  const bars = [];
  [16, 26, 22, 34].forEach((h, i) => {
    const r = svg('rect', { x: 600 + i * 22, y: 224, width: 14, height: 0, rx: 2, fill: C.mono, 'fill-opacity': 0.8 });
    root.appendChild(r); bars.push({ r, h });
  });

  scrub(root, (p) => {
    stars.forEach((s, i) => s.setAttribute('fill', hexLerp(C.rule, C.order, ease(clamp01(p * 5 - i)))));
    bars.forEach((b, i) => {
      const h = b.h * ease(clamp01((p - i * 0.07) / 0.7));
      b.r.setAttribute('height', h); b.r.setAttribute('y', 224 - h);
    });
  });
}

/* ===========================================================
   JAGGED FRONTIER — pick a measure, compare team types.
   Real means from Table 2: productivity +50% per worker;
   text 5.01 (H-H) vs 5.34 (H-AI), +0.327***; image 4.67 vs
   4.53, -0.133***.
   =========================================================== */
function buildFrontier() {
  const root = $('#frontierFig'); if (!root) return; clear(root);
  const PANELS = {
    prod:  { title: 'Ads produced per worker', min: 0,   max: 1.65, hai: { v: 1.5,  show: '+50%' },     hh: { v: 1.0,  show: 'baseline' }, win: 'hai', note: 'Human-AI teams made 50% more ads per worker' },
    text:  { title: 'Mean text-quality rating', min: 4.3, max: 5.6,  hai: { v: 5.34, show: '5.34' },      hh: { v: 5.01, show: '5.01' },     win: 'hai', note: 'Human-AI wrote better text  (+0.33, p<.001)' },
    image: { title: 'Mean image-quality rating', min: 4.3, max: 5.6, hai: { v: 4.53, show: '4.53' },      hh: { v: 4.67, show: '4.67' },     win: 'hh',  note: 'Human-human made better images  (−0.13, p<.001)' },
  };
  const baseY = 230, topY = 66, maxH = baseY - topY, barW = 120;
  const COLS = [{ key: 'hai', cx: 250, lab: 'Human-AI' }, { key: 'hh', cx: 470, lab: 'Human-Human' }];

  // static chrome
  const title = svg('text', { x: 360, y: 38, 'text-anchor': 'middle', fill: C.ink, 'font-size': 17, 'font-weight': 600, 'font-family': 'Inter, sans-serif' });
  root.appendChild(title);
  root.appendChild(svg('line', { x1: 120, y1: baseY, x2: 600, y2: baseY, stroke: C.rule, 'stroke-width': 1.5 }));
  const note = svg('text', { x: 360, y: 286, 'text-anchor': 'middle', fill: C.mute, 'font-size': 14, 'font-weight': 600, 'font-family': 'Inter, sans-serif' });
  root.appendChild(note);

  const bars = {}, vals = {};
  COLS.forEach((col) => {
    txt(root.appendChild(svg('text', { x: col.cx, y: baseY + 26, 'text-anchor': 'middle', fill: C.mute, 'font-size': 14, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), col.lab);
    const r = svg('rect', { x: col.cx - barW / 2, y: baseY, width: barW, height: 0, rx: 8, fill: C.rule });
    r.style.transition = 'fill .35s ease'; root.appendChild(r); bars[col.key] = r;
    const v = svg('text', { x: col.cx, y: baseY - 8, 'text-anchor': 'middle', fill: C.ink, 'font-size': 18, 'font-weight': 700, 'font-family': 'Inter, sans-serif' });
    root.appendChild(v); vals[col.key] = v;
  });

  const tH = {};
  function render(key) {
    const P = PANELS[key];
    txt(title, P.title); txt(note, P.note);
    COLS.forEach((col) => {
      const cell = P[col.key];
      tH[col.key] = Math.max(8, (cell.v - P.min) / (P.max - P.min) * maxH);
      bars[col.key].setAttribute('fill', P.win === col.key ? (col.key === 'hai' ? C.mono : C.nm) : C.rule);
      txt(vals[col.key], cell.show);
      vals[col.key].setAttribute('fill', P.win === col.key ? C.ink : C.dim);
    });
  }
  function apply(p) {
    const e = ease(p);
    COLS.forEach((col) => {
      const h = tH[col.key] * e;
      bars[col.key].setAttribute('height', h); bars[col.key].setAttribute('y', baseY - h);
      vals[col.key].setAttribute('y', baseY - h - 8);
    });
  }
  const seg = $('#frontierSeg');
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('.seg-btn'); if (!b) return;
    $$('.seg-btn', seg).forEach((x) => x.classList.toggle('is-on', x === b));
    render(b.dataset.k); apply(_progress(root));
  });
  render('prod');
  scrub(root, apply);
}

/* ===========================================================
   DIVERSITY COLLAPSE — two point clouds, each dot one ad.
   Human-AI ads sit closer to their centroid (Table 2,
   diversity beta -0.094***): a tighter, less varied cloud.
   =========================================================== */
function buildDiversity() {
  const root = $('#diversityFig'); if (!root) return; clear(root);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const CLOUDS = [
    { cx: 196, cy: 188, sd: 30, col: C.mono, lab: 'Human-AI', sub: 'tighter, more alike' },
    { cx: 520, cy: 188, sd: 62, col: C.nm,  lab: 'Human-Human', sub: 'wider, more varied' },
  ];
  const N = 84, dots = [];
  CLOUDS.forEach((cl) => {
    txt(root.appendChild(svg('text', { x: cl.cx, y: 40, 'text-anchor': 'middle', fill: C.ink, 'font-size': 16, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), cl.lab);
    txt(root.appendChild(svg('text', { x: cl.cx, y: 60, 'text-anchor': 'middle', fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' })), cl.sub);
    // spread halo
    root.appendChild(svg('circle', { cx: cl.cx, cy: cl.cy, r: cl.sd * 1.7, fill: cl.col, 'fill-opacity': 0.05, stroke: cl.col, 'stroke-opacity': 0.18, 'stroke-dasharray': '3 5' }));
    for (let i = 0; i < N; i++) {
      const fx = cl.cx + gauss() * cl.sd, fy = cl.cy + gauss() * cl.sd;
      const c = svg('circle', { cx: fx, cy: fy, r: 3.2, fill: cl.col, 'fill-opacity': 0, stroke: '#fff', 'stroke-width': 0.6 });
      root.appendChild(c); dots.push({ c, dx0: cl.cx - fx, dy0: cl.cy - fy });
    }
    // centroid mark
    const mk = (d1, d2) => root.appendChild(svg('line', Object.assign({ stroke: cl.col, 'stroke-width': 2 }, d1, d2)));
    mk({ x1: cl.cx - 8, y1: cl.cy }, { x2: cl.cx + 8, y2: cl.cy });
    mk({ x1: cl.cx, y1: cl.cy - 8 }, { x2: cl.cx, y2: cl.cy + 8 });
  });

  scrub(root, (p) => dots.forEach((d) => {
    const lp = ease(p);
    d.c.style.transform = `translate(${d.dx0 * (1 - lp)}px, ${d.dy0 * (1 - lp)}px)`;
    d.c.setAttribute('fill-opacity', 0.72 * clamp01(p * 1.6));
  }));
}

/* ===========================================================
   MECHANISM FIGURES (small, inside cards)
   =========================================================== */
// Task-oriented vs interpersonal: diverging from a center line.
function buildComm() {
  const root = $('#commFig'); if (!root) return; clear(root);
  const cx = 180, px = 4; // 1% = 4px
  root.appendChild(svg('line', { x1: cx, y1: 22, x2: cx, y2: 132, stroke: C.rule, 'stroke-width': 1.5 }));
  txt(root.appendChild(svg('text', { x: 12, y: 16, fill: C.dim, 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' })), 'more with human');
  txt(root.appendChild(svg('text', { x: 348, y: 16, 'text-anchor': 'end', fill: C.dim, 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' })), 'more with AI');
  const rows = [
    { lab: 'Task-oriented', pct: 25, dir: 1, col: C.mono },
    { lab: 'Interpersonal', pct: 18, dir: -1, col: C.nm },
  ];
  const animd = [];
  rows.forEach((R, i) => {
    const y = 46 + i * 56, w = R.pct * px;
    txt(root.appendChild(svg('text', { x: cx + R.dir * 6, y: y - 6, 'text-anchor': R.dir > 0 ? 'start' : 'end', fill: C.ink, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), R.lab);
    const bar = svg('rect', { x: cx, y, width: 0, height: 18, rx: 5, fill: R.col });
    root.appendChild(bar); animd.push({ bar, dir: R.dir, w });
    txt(root.appendChild(svg('text', { x: cx + R.dir * (w + 8), y: y + 14, 'text-anchor': R.dir > 0 ? 'start' : 'end', fill: R.col, 'font-size': 14, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), '+' + R.pct + '%');
  });
  scrub(root, (p) => animd.forEach((a, i) => {
    const ww = a.w * ease(clamp01((p - i * 0.12) / 0.7));
    a.bar.setAttribute('width', ww);
    a.bar.setAttribute('x', a.dir > 0 ? cx : cx - ww);
  }));
}

// Delegation share: human partner 50% vs AI partner 58%.
function buildDeleg() {
  const root = $('#delegFig'); if (!root) return; clear(root);
  const x0 = 132, maxPx = 200; // 100% -> 200px
  const rows = [
    { lab: 'Human partner', pct: 50, col: C.rule, tcol: C.mute },
    { lab: 'AI partner', pct: 58, col: C.mono, tcol: C.ink },
  ];
  const animd = [];
  rows.forEach((R, i) => {
    const y = 38 + i * 46;
    txt(root.appendChild(svg('text', { x: x0 - 12, y: y + 14, 'text-anchor': 'end', fill: C.mute, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), R.lab);
    root.appendChild(svg('rect', { x: x0, y, width: maxPx, height: 18, rx: 5, fill: C.cream3 }));
    const bar = svg('rect', { x: x0, y, width: 0, height: 18, rx: 5, fill: R.col });
    root.appendChild(bar);
    txt(root.appendChild(svg('text', { x: x0 + R.pct / 100 * maxPx + 8, y: y + 14, fill: R.tcol, 'font-size': 14, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), R.pct + '%');
    animd.push({ bar, w: R.pct / 100 * maxPx });
  });
  txt(root.appendChild(svg('text', { x: 180, y: 142, 'text-anchor': 'middle', fill: C.mono, 'font-size': 13, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), '+17% more work delegated to AI');
  scrub(root, (p) => animd.forEach((a, i) => a.bar.setAttribute('width', a.w * ease(clamp01((p - i * 0.12) / 0.74)))));
}

// Delegation -> quality: helps text & click, not image (jagged frontier).
function buildDelegQual() {
  const root = $('#delegQualFig'); if (!root) return; clear(root);
  const x0 = 150, scale = 300 / 0.35; // beta -> px
  root.appendChild(svg('line', { x1: x0, y1: 16, x2: x0, y2: 120, stroke: C.rule, 'stroke-width': 1.5 }));
  const rows = [
    { lab: 'Text rating', b: 0.302, tag: '+0.30***', col: C.mono },
    { lab: 'Click rating', b: 0.178, tag: '+0.18**', col: C.mono },
    { lab: 'Image rating', b: 0.132, tag: '+0.13  n.s.', col: C.rule },
  ];
  const animd = [];
  rows.forEach((R, i) => {
    const y = 26 + i * 34, w = R.b * scale;
    txt(root.appendChild(svg('text', { x: x0 - 12, y: y + 13, 'text-anchor': 'end', fill: C.mute, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), R.lab);
    const bar = svg('rect', { x: x0, y, width: 0, height: 17, rx: 5, fill: R.col });
    root.appendChild(bar);
    txt(root.appendChild(svg('text', { x: x0 + w + 8, y: y + 13, fill: R.col === C.rule ? C.dim : C.ink, 'font-size': 13, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), R.tag);
    animd.push({ bar, w });
  });
  scrub(root, (p) => animd.forEach((a, i) => a.bar.setAttribute('width', a.w * ease(clamp01((p - i * 0.12) / 0.74)))));
}

/* ===========================================================
   FIELD FIGURE — ad quality translates into field results
   A +1 SD gain in human-rated quality moves real-world metrics.
   Two distinct outcomes, shown as numbers (not a shared bar, the
   units differ). Manuscript (revision2): +1 SD text => +5.9% CTR;
   +1 SD image => -$0.31 / -4.2% CPC.
   =========================================================== */
function buildFieldFig() {
  const root = $('#fieldFig'); if (!root) return; clear(root);
  const ROWS = [
    { input: 'ad text', big: '↑ CTR', metric: 'more click-throughs (p<.001)' },
    { input: 'ad images', big: '−$0.29', metric: 'cost per click (p<.05)' },
  ];
  const cys = [98, 208];
  const groups = [];
  ROWS.forEach((R, i) => {
    const cy = cys[i];
    const g = svg('g', { opacity: 0 });

    // input chip: +1 SD of human-rated quality
    g.appendChild(svg('rect', { x: 24, y: cy - 33, width: 268, height: 66, rx: 12,
      fill: C.cream3, 'fill-opacity': 0.5, stroke: C.rule, 'stroke-width': 1 }));
    txt(g.appendChild(svg('text', { x: 46, y: cy - 7, fill: C.dim, 'font-size': 12, 'font-weight': 600,
      'letter-spacing': '0.06em', 'font-family': 'JetBrains Mono, monospace' })), '+1 SD RATED QUALITY');
    txt(g.appendChild(svg('text', { x: 46, y: cy + 19, fill: C.ink, 'font-size': 21, 'font-weight': 600,
      'font-family': 'Inter, sans-serif' })), 'better ' + R.input);

    // arrow into the field
    g.appendChild(svg('line', { x1: 308, y1: cy, x2: 372, y2: cy, stroke: C.mute, 'stroke-width': 2 }));
    g.appendChild(svg('path', { d: `M 372 ${cy - 5} L 382 ${cy} L 372 ${cy + 5} Z`, fill: C.mute }));
    txt(g.appendChild(svg('text', { x: 340, y: cy - 14, 'text-anchor': 'middle', fill: C.dim, 'font-size': 11,
      'font-weight': 600, 'letter-spacing': '0.06em', 'font-family': 'JetBrains Mono, monospace' })), 'IN FIELD');

    // headline field number + metric label
    txt(g.appendChild(svg('text', { x: 410, y: cy + 18, fill: C.mono, 'font-size': 52, 'font-weight': 600,
      'font-family': 'Newsreader, serif' })), R.big);
    txt(g.appendChild(svg('text', { x: 412, y: cy + 42, fill: C.mute, 'font-size': 14,
      'font-family': 'Inter, sans-serif' })), R.metric);

    root.appendChild(g); groups.push(g);
  });
  root.appendChild(svg('line', { x1: 24, y1: 153, x2: 696, y2: 153, stroke: C.rule, 'stroke-width': 1, 'stroke-dasharray': '2 5' }));

  scrub(root, (p) => groups.forEach((g, i) => {
    const lp = ease(clamp01((p - i * 0.18) / 0.72));
    g.setAttribute('opacity', lp);
    g.style.transform = `translateX(${14 * (1 - lp)}px)`;
  }));
}

/* ===========================================================
   COUNT-UP STATS
   =========================================================== */
function fmt(n, dec) {
  return dec ? n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
             : Math.round(n).toLocaleString('en-US');
}
function setupStats() {
  $$('[data-to]').forEach((n) => {
    const to = +n.dataset.to, dec = to % 1 !== 0;
    scrub(n, (p) => { n.textContent = fmt(to * ease(p), dec); });
  });
}

/* ===========================================================
   SIDE-NAV SCROLL SPY + copy
   =========================================================== */
function setupSideNav() {
  const links = $$('.side-nav a[data-target]');
  const sections = links.map((l) => document.getElementById(l.dataset.target)).filter(Boolean);
  function update() {
    const probe = window.scrollY + window.innerHeight * 0.3;
    let active = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= probe) active = s; });
    links.forEach((l) => l.classList.toggle('is-active', l.dataset.target === active.id));
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update); update();
}
function setupCopy() {
  $$('.cite-block').forEach((block) => {
    const btn = block.querySelector('.copy'), pre = block.querySelector('.bib');
    if (!btn || !pre) return;
    btn.addEventListener('click', () => navigator.clipboard.writeText(pre.textContent).then(() => {
      btn.textContent = 'Copied'; btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
    }));
  });
}

/* ---------- scroll-scrubbed reveal ---------- */
function setupReveal() {
  const els = $$('.band .sec-num, .band .lead, #setup .connect, .fig-card, .field-fig, .mech-card, .paper-link, .cite-block');
  els.forEach((el) => {
    el.style.opacity = '0';
    scrub(el, (p) => {
      const lp = clamp01((p - 0.05) / 0.5);
      el.style.opacity = lp;
      el.style.transform = `translateY(${18 * (1 - lp)}px)`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildHero(); buildRandomize(); buildEvaluate(); buildFrontier();
  buildDiversity(); buildFieldFig(); buildComm(); buildDeleg();
  buildDelegQual();
  setupStats(); setupSideNav(); setupCopy(); setupReveal(); setupScrub();
});
