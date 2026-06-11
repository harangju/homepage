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
const now = () => performance.now();

/* ---------- tooltip ---------- */
const tip = $('#tooltip');
function showTip(e, t) { tip.textContent = t; tip.classList.add('show'); moveTip(e); }
function moveTip(e) { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; }
function hideTip() { tip.classList.remove('show'); }
function bindTip(node, t) {
  node.addEventListener('mouseenter', (e) => showTip(e, t));
  node.addEventListener('mousemove', moveTip);
  node.addEventListener('mouseleave', hideTip);
}

/* ===========================================================
   DATA
   =========================================================== */
const TRAITS = [
  { k: 'O', name: 'Openness' },
  { k: 'C', name: 'Conscientiousness' },
  { k: 'E', name: 'Extraversion' },
  { k: 'A', name: 'Agreeableness' },
  { k: 'N', name: 'Neuroticism' },
];
const NAME = Object.fromEntries(TRAITS.map((t) => [t.k, t.name]));
const ADJ = { O: 'Open', C: 'Conscientious', E: 'Extravert', A: 'Agreeable', N: 'Neurotic' };

// Real coefficients from SI Table tab:ad_quality_itx (ordinal logit on
// individual ratings, HC1 SE). Each cell = [text, image, click], each
// [coef, sig] where sig 0=n.s. 1=p<.1 2=p<.05 3=p<.01 4=p<.001.
// Rows = human trait, cols = AI trait, both ordered O,C,E,A,N.
const DATA = {
  O: {
    O: { t: [0.147, 0], i: [-0.206, 1], c: [-0.084, 0] },
    C: { t: [0.302, 3], i: [0.111, 0], c: [0.141, 0] },
    E: { t: [-0.040, 0], i: [-0.094, 0], c: [-0.105, 0] },
    A: { t: [-0.303, 3], i: [0.273, 3], c: [0.106, 0] },
    N: { t: [-0.022, 0], i: [0.062, 0], c: [0.087, 0] },
  },
  C: {
    O: { t: [-0.108, 0], i: [0.427, 3], c: [0.043, 0] },
    C: { t: [0.506, 4], i: [0.057, 0], c: [0.109, 0] },
    E: { t: [-0.124, 0], i: [-0.013, 0], c: [0.014, 0] },
    A: { t: [-0.594, 4], i: [-0.342, 3], c: [-0.337, 2] },
    N: { t: [0.206, 0], i: [0.067, 0], c: [0.142, 0] },
  },
  E: {
    O: { t: [0.195, 1], i: [0.271, 2], c: [0.266, 2] },
    C: { t: [-0.472, 4], i: [-0.518, 4], c: [-0.436, 4] },
    E: { t: [0.344, 3], i: [-0.097, 0], c: [0.139, 0] },
    A: { t: [0.112, 0], i: [-0.085, 0], c: [0.025, 0] },
    N: { t: [-0.241, 2], i: [0.114, 0], c: [-0.017, 0] },
  },
  A: {
    O: { t: [-0.030, 0], i: [-0.285, 3], c: [-0.176, 0] },
    C: { t: [0.074, 0], i: [-0.097, 0], c: [-0.015, 0] },
    E: { t: [-0.367, 4], i: [-0.076, 0], c: [-0.216, 2] },
    A: { t: [-0.022, 0], i: [0.058, 0], c: [0.051, 0] },
    N: { t: [0.264, 2], i: [-0.109, 0], c: [-0.107, 0] },
  },
  N: {
    O: { t: [0.037, 0], i: [0.066, 0], c: [-0.109, 0] },
    C: { t: [-0.143, 0], i: [-0.193, 1], c: [-0.262, 3] },
    E: { t: [0.157, 0], i: [0.086, 0], c: [0.181, 1] },
    A: { t: [0.015, 0], i: [-0.235, 2], c: [-0.084, 0] },
    N: { t: [-0.163, 0], i: [-0.138, 0], c: [-0.048, 0] },
  },
};
const FIELD = { NN: true }; // neurotic-H × neurotic-AI: field CTR result, p=.036

// sample dialogue per highlighted cell {lines:[{w,t}], cap}
const SNIP = {
  EC: { lines: [
      { w: 'H', t: 'Make the headline bold and loud. Go big.' },
      { w: 'AI', t: 'On it — updated to a bold, high-energy headline.' },
      { w: 'H', t: 'Now the same energy in the subtext.' },
      { w: 'AI', t: 'Done.' } ],
    cap: 'The AI never asks whether "bold and loud" fits the audience. It just executes.' },
  CA: { lines: [
      { w: 'H', t: 'Three tight benefit bullets, formal tone.' },
      { w: 'AI', t: 'Sure — three formal benefit bullets, as requested.' },
      { w: 'H', t: 'Good, lock it in.' } ],
    cap: 'Compliant implementation. The plan is never challenged.' },
  CC: { lines: [
      { w: 'H', t: 'Three benefit bullets, formal tone.' },
      { w: 'AI', t: 'Done. Bullet 2 repeats the headline — swap in the cost angle?' },
      { w: 'H', t: 'Good catch, yes.' } ],
    cap: 'A disciplined AI refines rather than rubber-stamps.' },
  NC: { lines: [
      { w: 'H', t: 'None of this is working. Change everything.' },
      { w: 'AI', t: 'Okay, revised the headline, image, and copy as asked.' },
      { w: 'H', t: 'Still not right...' } ],
    cap: 'A volatile process the AI absorbs without steadying.' },
  EE: { lines: [
      { w: 'H', t: "Let's make it exciting!" },
      { w: 'AI', t: 'Love it! Bumped the energy — punchy verb up front?' },
      { w: 'H', t: 'Yes! Do it.' } ],
    cap: 'Two high-energy partners build on each other.' },
  CO: { lines: [
      { w: 'H', t: 'Keep it precise. Lead with the report.' },
      { w: 'AI', t: 'Agreed. What if we open with one striking figure from it?' },
      { w: 'H', t: 'Nice, try that.' } ],
    cap: 'Open AI offers angles; a precise human keeps them grounded.' },
  OC: { lines: [
      { w: 'H', t: 'Throw a few wild directions at me.' },
      { w: 'AI', t: 'Three options. I think #2 is tightest — shall we develop it?' },
      { w: 'H', t: 'Good call.' } ],
    cap: 'A conscientious AI converges the open human onto one strong idea.' },
  EO: { lines: [
      { w: 'H', t: "Give me the boldest version. Big swing." },
      { w: 'AI', t: 'Here are three angles — one safe, two daring. Want to push the daring one?' },
      { w: 'H', t: 'Yes, the daring one.' } ],
    cap: 'An open AI feeds the assertive human more to choose from.' },
  NN: { lines: [
      { w: 'H', t: "I'm worried the click rate will be low." },
      { w: 'AI', t: 'Same concern. Be very direct — lead with the number, hard CTA.' },
      { w: 'H', t: 'Yes. Tell them exactly what to do.' } ],
    cap: 'Two anxious partners converge on blunt, directive, high-CTR copy.' },
};
const SNIP_DEFAULT = { lines: [
    { w: 'H', t: 'How about we open with the headline?' },
    { w: 'AI', t: 'Works for me. I drafted one — tweak as you like.' },
    { w: 'H', t: 'Looks fine, moving on.' } ],
  cap: 'No distinctive pairing signature here.' };

/* ===========================================================
   MATRIX (interactive)
   =========================================================== */
const MX = { ox: 96, oy: 78, step: 74, cell: 64 };
function cellRect(c, r) { return { x: MX.ox + c * MX.step, y: MX.oy + r * MX.step, w: MX.cell, h: MX.cell }; }

// derive a cell summary from the real coefficients
function cellOf(h, a) {
  const d = DATA[h][a];
  const dims = [['Text', d.t], ['Image', d.i], ['Click', d.c]];
  const comp = (d.t[0] + d.i[0] + d.c[0]) / 3;
  const sig = dims.filter(([, v]) => v[1] >= 2);            // p < .05
  const signs = new Set(sig.map(([, v]) => Math.sign(v[0])));
  const mixed = signs.size > 1;
  return { h, a, dims, comp, sig, mixed, field: !!FIELD[h + a], anySig: sig.length > 0 };
}
function fillOf(x) {
  if (x.field && !x.anySig) return { fill: C.mono, op: 0.6 };
  if (!x.anySig) return { fill: C.cream3, op: 1 };
  if (x.mixed) return { fill: C.order, op: 0.5 };
  const op = Math.max(0.3, Math.min(Math.abs(x.comp) / 0.45, 0.92));
  return { fill: x.comp >= 0 ? C.mono : C.nm, op };
}
function glyphOf(x) {
  if (x.field && !x.anySig) return '★';
  if (!x.anySig) return '';
  if (x.mixed) return '±';
  return x.comp > 0 ? '+' : '–';
}
function verbOf(x) {
  if (x.field && !x.anySig) return { txt: 'Improves field CTR directly', cls: 'field' };
  if (!x.anySig) return { txt: 'Not significant', cls: 'neutral' };
  if (x.mixed) return { txt: 'Mixed effect', cls: 'mixed' };
  return x.comp > 0 ? { txt: 'Improves quality', cls: 'good' } : { txt: 'Worsens quality', cls: 'bad' };
}

function frame(root) {
  clear(root);
  // axis titles
  txt(root.appendChild(svg('text', { x: MX.ox + 2.5 * MX.step, y: 30, 'text-anchor': 'middle',
    fill: C.mute, 'font-size': 15, 'font-weight': 600, 'font-family': 'Inter, sans-serif' })), 'AI agent personality (randomized)');
  txt(root.appendChild(svg('text', { x: 24, y: MX.oy + 2.5 * MX.step, 'text-anchor': 'middle',
    fill: C.mute, 'font-size': 15, 'font-weight': 600, 'font-family': 'Inter, sans-serif',
    transform: `rotate(-90 24 ${MX.oy + 2.5 * MX.step})` })), 'Human personality');
  // column headers (letters)
  TRAITS.forEach((t, c) => {
    const x = MX.ox + c * MX.step + MX.cell / 2;
    txt(root.appendChild(svg('text', { x, y: MX.oy - 14, 'text-anchor': 'middle',
      fill: C.ink, 'font-size': 19, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace' })), t.k);
  });
  // row labels (letters)
  TRAITS.forEach((t, r) => {
    const y = MX.oy + r * MX.step + MX.cell / 2 + 7;
    txt(root.appendChild(svg('text', { x: MX.ox - 16, y, 'text-anchor': 'end',
      fill: C.ink, 'font-size': 19, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace' })), t.k);
  });
}

function buildCell(root, r, c, interactive) {
  const h = TRAITS[r].k, a = TRAITS[c].k, x = cellOf(h, a), f = fillOf(x);
  const rc = cellRect(c, r);
  const g = svg('g', interactive ? { class: 'mx-cell' } : {});
  const rect = svg('rect', { x: rc.x, y: rc.y, width: rc.w, height: rc.h, rx: 9,
    fill: f.fill, 'fill-opacity': f.op, stroke: C.rule, 'stroke-width': 1 });
  g.appendChild(rect);
  const gl = glyphOf(x);
  if (gl) {
    const col = x.field ? '#fff' : x.mixed ? C.order : (f.op >= 0.6 ? '#fff' : (x.comp > 0 ? C.mono : C.nm));
    txt(g.appendChild(svg('text', { x: rc.x + rc.w / 2, y: rc.y + rc.h / 2 + 7, 'text-anchor': 'middle',
      fill: col, 'font-size': 22, 'font-weight': 700, 'font-family': 'Inter, sans-serif' })), gl);
  }
  root.appendChild(g);
  bindTip(g, `${NAME[h]} × ${NAME[a]} AI — ${verbOf(x).txt}`);
  g._rc = rc; g._ha = [r, c]; g._rect = rect;
  return g;
}

/* ----- interactive matrix ----- */
function buildExplorer() {
  const root = $('#heroMatrix');
  frame(root);
  let ring = null;
  function select(r, c, g) {
    const rc = g._rc;
    if (!ring) { ring = svg('rect', { rx: 11, fill: 'none', stroke: C.ink, 'stroke-width': 2.6 }); root.appendChild(ring); }
    ring.setAttribute('x', rc.x - 3); ring.setAttribute('y', rc.y - 3);
    ring.setAttribute('width', rc.w + 6); ring.setAttribute('height', rc.h + 6);
    renderDetail(TRAITS[r].k, TRAITS[c].k);
  }
  let firstG = null;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const g = buildCell(root, r, c, true);
    g.addEventListener('click', () => select(r, c, g));
    if (r === 2 && c === 1) firstG = g; // E human × C AI, the headline finding
  }
  // raise ring above cells by re-appending on select; default selection
  if (firstG) firstG.dispatchEvent(new Event('click'));
}

const STAR = ['', '†', '*', '**', '***'];
let detailGen = 0;
function renderDetail(h, a) {
  const gen = ++detailGen;
  const x = cellOf(h, a);
  $('#pairTitle').innerHTML = `${NAME[h]} <span style="color:var(--ink-dim)">human</span> × ${NAME[a]} <span style="color:var(--ink-dim)">AI</span>`;

  // mini coefficient plot from the real SI values, built at width 0
  const box = $('#pairCoefs'); clear(box);
  const bars = [];
  x.dims.forEach(([name, v2]) => {
    const [coef, sig] = v2, w = Math.min(Math.abs(coef) / 0.6, 1) * 50;
    const row = el('div', 'coef-row');
    row.appendChild(el('span', 'coef-dim', name));
    const track = el('div', 'coef-track');
    const bar = el('i', 'coef-bar ' + (coef >= 0 ? 'pos' : 'neg') + (sig < 2 ? ' dim' : ''));
    bar.style[coef >= 0 ? 'left' : 'right'] = '50%';
    track.appendChild(bar); row.appendChild(track);
    row.appendChild(el('span', 'coef-val', coef.toFixed(2) + '<span class="star">' + STAR[sig] + '</span>'));
    box.appendChild(row);
    bars.push([bar, w]);
  });

  // chat bubbles stream in, then the coefficient bars grow
  const snip = SNIP[h + a] || SNIP_DEFAULT;
  const chat = $('#pairChat'); clear(chat);
  const cap = $('#pairCap'); cap.textContent = ''; cap.classList.remove('show');
  const step = prefersReduced ? 0 : 360;
  snip.lines.forEach((l, i) => setTimeout(() => {
    if (gen !== detailGen) return;
    const b = el('div', 'bubble ' + (l.w === 'H' ? 'h' : 'ai'));
    b.appendChild(el('span', 'who', l.w === 'H' ? 'Human' : 'AI'));
    b.appendChild(document.createTextNode(l.t));
    chat.appendChild(b);
  }, step * i));
  setTimeout(() => {
    if (gen !== detailGen) return;
    bars.forEach(([bar, w]) => { bar.style.width = w + '%'; });
    cap.textContent = snip.cap; cap.classList.add('show');
  }, prefersReduced ? 0 : step * snip.lines.length + 240);
}

/* ===========================================================
   HERO — pairing → outcome, looping over real cells
   =========================================================== */
const HERO_SCENES = [{ h: 'E', a: 'C' }, { h: 'C', a: 'C' }, { h: 'C', a: 'A' }, { h: 'E', a: 'O' }, { h: 'N', a: 'N' }, { h: 'O', a: 'A' }];
function verbColor(cls) {
  return cls === 'good' || cls === 'field' ? C.mono : cls === 'bad' ? C.nm : cls === 'mixed' ? C.order : C.mute;
}
function buildHeroAnim() {
  const root = $('#heroSvg'); clear(root);
  const hx = 132, ax = 352, rx = 612, cy = 132, tw = 168, th = 112;
  const d = (ms) => prefersReduced ? 0 : ms;

  const tileRect = (x) => svg('rect', { x: x - tw / 2, y: cy - th / 2, width: tw, height: th, rx: 12,
    fill: C.paper, stroke: C.rule, 'stroke-width': 1.5 });
  root.append(tileRect(hx), tileRect(ax));
  const resRect = svg('rect', { x: rx - 56, y: cy - 56, width: 112, height: 112, rx: 12,
    fill: C.cream3, 'fill-opacity': 1, stroke: C.rule, 'stroke-width': 1.5 });
  resRect.style.transition = 'fill .5s ease, fill-opacity .5s ease';
  root.appendChild(resRect);

  const role = (x, s) => txt(root.appendChild(svg('text', { x, y: cy - 36, 'text-anchor': 'middle',
    fill: C.dim, 'font-size': 11, 'font-weight': 600, 'letter-spacing': '0.08em', 'font-family': 'JetBrains Mono, monospace' })), s);
  role(hx, 'HUMAN'); role(ax, 'AI AGENT'); role(rx, 'OUTCOME');
  const op = (x, s) => txt(root.appendChild(svg('text', { x, y: cy + 9, 'text-anchor': 'middle',
    fill: C.dim, 'font-size': 30, 'font-family': 'Inter, sans-serif' })), s);
  op((hx + ax) / 2, '×'); op((ax + rx) / 2, '→');

  const tnode = (x, y, attrs) => { const n = svg('text', Object.assign({ x, y, 'text-anchor': 'middle', opacity: 0 }, attrs)); n.style.transition = 'opacity .35s ease'; root.appendChild(n); return n; };
  const hL = tnode(hx, cy + 6, { fill: C.ink, 'font-size': 30, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace' });
  const hA = tnode(hx, cy + 32, { fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' });
  const aL = tnode(ax, cy + 6, { fill: C.ink, 'font-size': 30, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace' });
  const aA = tnode(ax, cy + 32, { fill: C.mute, 'font-size': 13, 'font-family': 'Inter, sans-serif' });
  const rG = tnode(rx, cy + 14, { fill: '#fff', 'font-size': 42, 'font-weight': 700, 'font-family': 'Inter, sans-serif' });
  const cap = tnode(360, 250, { fill: C.mute, 'font-size': 21, 'font-weight': 600, 'font-family': 'Inter, sans-serif' });

  let scene = 0;
  function show(s) {
    const sc = HERO_SCENES[s], x = cellOf(sc.h, sc.a), f = fillOf(x), v = verbOf(x);
    [hL, hA, aL, aA, rG, cap].forEach((n) => n.setAttribute('opacity', 0));
    resRect.setAttribute('fill', C.cream3); resRect.setAttribute('fill-opacity', 1);
    setTimeout(() => {
      txt(hL, sc.h); txt(hA, ADJ[sc.h]); txt(aL, sc.a); txt(aA, ADJ[sc.a]);
      txt(rG, glyphOf(x)); rG.setAttribute('fill', x.field ? '#fff' : x.mixed ? C.order : (f.op >= 0.6 ? '#fff' : (x.comp > 0 ? C.mono : C.nm)));
      txt(cap, v.txt); cap.setAttribute('fill', verbColor(v.cls));
      hL.setAttribute('opacity', 1); hA.setAttribute('opacity', 1);
      setTimeout(() => { aL.setAttribute('opacity', 1); aA.setAttribute('opacity', 1); }, d(280));
      setTimeout(() => { resRect.setAttribute('fill', f.fill); resRect.setAttribute('fill-opacity', f.op); rG.setAttribute('opacity', 1); }, d(620));
      setTimeout(() => cap.setAttribute('opacity', 1), d(840));
    }, d(360));
  }
  function run() { show(scene); scene = (scene + 1) % HERO_SCENES.length; }
  run();
  if (!prefersReduced) setInterval(run, 3400);
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
    { input: 'ad text', big: '+5.9%', metric: 'click-through rate' },
    { input: 'ad images', big: '−$0.31', metric: 'cost per click (4.2% lower)' },
  ];
  const cys = [98, 208];
  const groups = [];
  ROWS.forEach((R, i) => {
    const cy = cys[i];
    const g = svg('g', { opacity: 0 }); g.style.transition = 'opacity .6s ease, transform .6s ease';
    g.style.transform = prefersReduced ? 'none' : 'translateX(14px)';

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

  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; obs.unobserve(e.target);
    groups.forEach((g, i) => setTimeout(() => {
      g.setAttribute('opacity', 1); g.style.transform = 'none';
    }, prefersReduced ? 0 : 160 + i * 240));
  }), { threshold: 0.3 });
  obs.observe(root);
}

/* ===========================================================
   COUNT-UP STATS
   =========================================================== */
function fmt(n, dec) {
  return dec ? n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
             : Math.round(n).toLocaleString('en-US');
}
function countUp(node) {
  const to = +node.dataset.to, dec = to % 1 !== 0;
  if (prefersReduced) { node.textContent = fmt(to, dec); return; }
  const dur = 1100; let start = null;
  (function step(t) {
    if (start === null) start = t;
    const p = Math.min((t - start) / dur, 1), v = (1 - Math.pow(1 - p, 3)) * to;
    node.textContent = fmt(v, dec);
    if (p < 1) requestAnimationFrame(step);
  })(now());
}
function setupStats() {
  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('.stat-num').forEach((n) => obs.observe(n));
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
  const btn = $('#copyBib');
  btn.addEventListener('click', () => navigator.clipboard.writeText($('#bib').textContent).then(() => {
    btn.textContent = 'Copied'; btn.classList.add('done');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeroAnim(); buildExplorer(); buildFieldFig(); setupStats(); setupSideNav(); setupCopy();
});
