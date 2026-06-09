/* ===========================================================
   When Coordination Is Avoidable — interactions
   Hand-rolled SVG + rAF. No dependencies.
   =========================================================== */
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const C = {
  mono:  '#2e7d32', monoSoft: '#cfe6d0',
  order: '#b8860b', orderSoft: '#f0e2bf',
  nm:    '#c0392b', nmSoft: '#f3d2cd',
  ink:   '#1b1a17', mute: '#6b6759', dim: '#94907f',
  rule:  '#ddd8c9', paper: '#ffffff', accent: '#3a3a8c'
};

function svg(tag, attrs = {}) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
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
   1. HERO — conclusions accumulate; one retraction breaks it
   =========================================================== */
function buildHero() {
  const root = $('#heroSvg');
  const cardW = 76, cardH = 58, y = 96, gap = 92, x0 = 56;
  const cards = []; // {g, rect, x, cx}

  const cap = svg('text', { x: x0, y: 50, fill: C.mono, 'font-size': 12,
    'font-family': 'JetBrains Mono, monospace', 'letter-spacing': '0.06em' });
  txt(cap, 'Monotonic — each step only adds');
  root.appendChild(cap);
  const layer = svg('g'); root.appendChild(layer);

  function addCard(i) {
    const x = x0 + i * gap, cx = x + cardW / 2;
    const g = svg('g', { opacity: 0 });
    const rect = svg('rect', { x, y, width: cardW, height: cardH, rx: 9,
      fill: C.monoSoft, stroke: C.mono, 'stroke-width': 2 });
    const label = svg('text', { x: cx, y: y + cardH / 2 + 4, 'text-anchor': 'middle',
      fill: C.mono, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' });
    txt(label, 'c' + (i + 1));
    g.append(rect, label);
    if (i > 0) {
      const px = x0 + (i - 1) * gap + cardW;
      const ln = svg('line', { x1: px, y1: y + cardH / 2, x2: px, y2: y + cardH / 2, stroke: C.rule, 'stroke-width': 2 });
      layer.appendChild(ln);
      requestAnimationFrame(() => { ln.style.transition = 'all .3s ease'; ln.setAttribute('x2', x); });
    }
    layer.appendChild(g);
    requestAnimationFrame(() => { g.style.transition = 'opacity .35s ease'; g.setAttribute('opacity', 1); });
    cards.push({ g, rect, x, cx });
  }

  function retract(targetIdx, stepX) {
    // a later step marker
    const mg = svg('g', { opacity: 0 });
    mg.appendChild(svg('circle', { cx: stepX, cy: y + cardH / 2, r: 19, fill: C.paper, stroke: C.nm, 'stroke-width': 2.5 }));
    const mt = svg('text', { x: stepX, y: y + cardH / 2 + 6, 'text-anchor': 'middle', fill: C.nm, 'font-size': 20, 'font-weight': 700, 'font-family': 'Inter, sans-serif' });
    txt(mt, '–');
    mg.appendChild(mt);
    layer.appendChild(mg);
    requestAnimationFrame(() => { mg.style.transition = 'opacity .35s ease'; mg.setAttribute('opacity', 1); });

    const tc = cards[targetIdx];
    // curved arrow from step marker back to the target card, routed under the row
    const endX = tc.cx, endY = y + cardH + 4;
    const path = svg('path', {
      d: `M ${stepX} ${y + cardH} C ${stepX - 40} ${y + cardH + 74}, ${tc.cx + 40} ${y + cardH + 74}, ${endX} ${endY}`,
      fill: 'none', stroke: C.nm, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: 0
    });
    layer.appendChild(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.setAttribute('opacity', 1);
    // arrowhead detached from the path so it appears only when the line finishes drawing
    const ang = Math.atan2(endY - (y + cardH + 74), endX - (tc.cx + 40)) * 180 / Math.PI;
    const head = svg('path', { d: 'M 0 0 L -11 -5 L -11 5 z', fill: C.nm, opacity: 0,
      transform: `translate(${endX} ${endY}) rotate(${ang})` });
    layer.appendChild(head);
    requestAnimationFrame(() => { path.style.transition = 'stroke-dashoffset .5s ease'; path.style.strokeDashoffset = 0; });

    setTimeout(() => {
      head.style.transition = 'opacity .18s ease'; head.setAttribute('opacity', 1);
      // invalidate the target card
      tc.rect.style.transition = 'all .4s ease';
      tc.rect.setAttribute('fill', C.nmSoft); tc.rect.setAttribute('stroke', C.nm);
      const cy = y + cardH / 2;
      layer.appendChild(svg('line', { x1: tc.x + 12, y1: cy - 12, x2: tc.x + cardW - 12, y2: cy + 12, stroke: C.nm, 'stroke-width': 2.5 }));
      layer.appendChild(svg('line', { x1: tc.x + cardW - 12, y1: cy - 12, x2: tc.x + 12, y2: cy + 12, stroke: C.nm, 'stroke-width': 2.5 }));
      cap.textContent = 'Non-monotonic — a later step invalidated c' + (targetIdx + 1) + ', so coordination is required';
      cap.setAttribute('fill', C.nm);
    }, 520);
  }


  function run() {
    clear(layer); cards.length = 0;
    cap.textContent = 'Monotonic — each step only adds'; cap.setAttribute('fill', C.mono);
    const T = prefersReduced ? 1 : 1;
    let t = 400;
    const tick = (ms, fn) => { setTimeout(fn, prefersReduced ? Math.min(ms, 40) : ms); };
    [0, 1, 2, 3, 4].forEach((i) => tick(t += 720, () => addCard(i)));
    tick(t += 950, () => retract(1, x0 + 5 * gap + 4));
    tick(t += 2600, run); // loop
  }
  run();
}

/* ===========================================================
   2. MONOTONICITY EXPLORER
   =========================================================== */
const EX_STATE = { struct: 'pooled', fb: 'additive' };
const EX_VERDICT = {
  pooled: () => ({ tag: 'Monotonic', cls: '', sub: 'coordination-free',
    note: 'Independent contributions merge by union. Adding any agent only enlarges the result, so nothing can ever be invalidated.' }),
  sequential: (fb) => fb === 'additive'
    ? { tag: 'Monotonic', cls: 'is-order', sub: 'coordination-free under causal ordering',
        note: 'Ordered handoffs where each stage builds on the last. Additive feedback adds detail without undoing prior work, so monotonicity holds.' }
    : { tag: 'Non-monotonic', cls: 'is-nm', sub: 'coordination required',
        note: 'A downstream stage sends work back to be revised or replaced. Retracting a prior output crosses the boundary: coordination is now required.' },
  reciprocal: (fb) => fb === 'additive'
    ? { tag: 'Monotonic', cls: '', sub: 'coordination-free',
        note: 'Mutual adjustment, but agents only add to one another. Reciprocal structure alone does not break monotonicity when feedback is purely additive.' }
    : { tag: 'Non-monotonic', cls: 'is-nm', sub: 'coordination required',
        note: 'Mutual adjustment where feedback retracts or constrains earlier outputs, often a shared finite resource. This is the costly case Thompson flagged.' }
};
function drawExplorer() {
  const root = $('#exSvg'); clear(root);
  const { struct, fb } = EX_STATE;
  const isNM = (struct !== 'pooled') && fb === 'retractive';
  const edgeCol = isNM ? C.nm : C.mono;
  const defs = svg('defs');
  [['m', C.mono], ['nm', C.nm]].forEach(([id, col]) => {
    const mk = svg('marker', { id: 'arrow-' + id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
    mk.appendChild(svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: col })); defs.appendChild(mk);
  });
  root.appendChild(defs);
  function node(x, y, label, col) {
    const g = svg('g');
    g.appendChild(svg('circle', { cx: x, cy: y, r: 22, fill: C.paper, stroke: col, 'stroke-width': 2.5 }));
    g.appendChild(txt(svg('text', { x, y: y + 4, 'text-anchor': 'middle', fill: col, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' }), label));
    root.appendChild(g);
  }
  function edge(x1, y1, x2, y2, col, flow) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ln = svg('line', { x1: x1 + 24 * Math.cos(a), y1: y1 + 24 * Math.sin(a), x2: x2 - 24 * Math.cos(a), y2: y2 - 24 * Math.sin(a), stroke: col, 'stroke-width': 2.4, 'marker-end': 'url(#arrow-' + (col === C.nm ? 'nm' : 'm') + ')' });
    if (flow && !prefersReduced) ln.setAttribute('class', 'flow');
    root.appendChild(ln);
  }
  if (struct === 'pooled') {
    [55, 130, 205].forEach((yy, k) => { node(70, yy, 'A' + (k + 1), C.mono); edge(70, yy, 230, 130, C.mono, true); });
    node(230, 130, '∪', C.mono); edge(230, 130, 350, 130, C.mono, true); node(350, 130, 'out', C.mono);
  } else if (struct === 'sequential') {
    edge(70, 130, 210, 130, C.mono, true); edge(210, 130, 350, 130, C.mono, true);
    const arc = svg('path', { d: 'M 350 108 Q 210 28 70 108', fill: 'none', stroke: edgeCol, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', 'marker-end': 'url(#arrow-' + (isNM ? 'nm' : 'm') + ')' });
    root.appendChild(arc);
    root.appendChild(txt(svg('text', { x: 210, y: 38, 'text-anchor': 'middle', fill: edgeCol, 'font-size': 12, 'font-family': 'JetBrains Mono, monospace' }), fb === 'additive' ? 'feedback: adds (+)' : 'feedback: retracts (–)'));
    node(70, 130, 'A', isNM ? C.nm : C.mono); node(210, 130, 'B', C.mono); node(350, 130, 'C', C.mono);
  } else {
    const P = { A: [110, 70], B: [110, 200], C: [320, 135] };
    const flow = fb === 'additive';
    edge(P.A[0], P.A[1], P.C[0], P.C[1], edgeCol, flow); edge(P.C[0], P.C[1], P.A[0], P.A[1], edgeCol, flow);
    edge(P.B[0], P.B[1], P.C[0], P.C[1], edgeCol, flow); edge(P.C[0], P.C[1], P.B[0], P.B[1], edgeCol, flow);
    node(P.A[0], P.A[1], 'A', isNM ? C.nm : C.mono); node(P.B[0], P.B[1], 'B', C.mono); node(P.C[0], P.C[1], 'C', isNM ? C.nm : C.mono);
    root.appendChild(txt(svg('text', { x: 215, y: 245, 'text-anchor': 'middle', fill: edgeCol, 'font-size': 12, 'font-family': 'JetBrains Mono, monospace' }), fb === 'additive' ? 'mutual feedback: adds (+)' : 'mutual feedback: retracts (–)'));
  }
  const v = EX_VERDICT[struct](fb);
  const tag = $('#vTag'); tag.textContent = v.tag; tag.className = 'v-tag ' + v.cls;
  $('#vSub').textContent = v.sub; $('#exNote').textContent = v.note;
}
function setupExplorer() {
  const fbGroup = $('#fbGroup');
  $$('.seg[data-struct]').forEach((b) => b.addEventListener('click', () => {
    $$('.seg[data-struct]').forEach((x) => x.classList.remove('is-on')); b.classList.add('is-on');
    EX_STATE.struct = b.dataset.struct;
    fbGroup.classList.toggle('is-disabled', EX_STATE.struct === 'pooled'); drawExplorer();
  }));
  $$('.seg[data-fb]').forEach((b) => b.addEventListener('click', () => {
    $$('.seg[data-fb]').forEach((x) => x.classList.remove('is-on')); b.classList.add('is-on');
    EX_STATE.fb = b.dataset.fb; drawExplorer();
  }));
  drawExplorer();
}

/* ===========================================================
   3a. SIMULATION ANIMATION — agents at work
   =========================================================== */
const SIM = {
  budget: {
    title: 'Budget allocation', type: 'NM', constraint: 'Shared budget must sum to ≤ $100',
    claims: ['$40', '$35', '$45'], claimVals: [40, 35, 45],
    fixed: ['$33', '$33', '$34'], fixedVals: [33, 33, 34],
    meter: true, max: 130, limit: 100, unit: '$'
  },
  strategy: {
    title: 'Strategy pillars', type: 'M', constraint: 'Each agent writes one independent pillar',
    claims: ['Growth', 'Talent', 'Product'], fixed: ['Growth', 'Talent', 'Product'],
    meter: false
  }
};
let simTask = 'budget', simCond = 'uncoordinated', simGen = 0;

function flyToken(root, x1, y1, x2, y2, label, color, gen, onArrive) {
  const g = svg('g');
  const c = svg('rect', { x: -20, y: -12, width: 40, height: 24, rx: 7, fill: color, opacity: 0.95 });
  const t = txt(svg('text', { x: 0, y: 5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 600, 'font-family': 'Inter, sans-serif' }), label);
  g.append(c, t); g.setAttribute('transform', `translate(${x1},${y1})`); root.appendChild(g);
  const dur = prefersReduced ? 1 : 620, t0 = now();
  (function step() {
    if (gen !== simGen) { g.remove(); return; }
    const p = Math.min((now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    g.setAttribute('transform', `translate(${x1 + (x2 - x1) * e},${y1 + (y2 - y1) * e})`);
    if (p < 1) requestAnimationFrame(step); else { g.remove(); onArrive && onArrive(); }
  })();
}

function playSim() {
  const root = $('#simSvg'); clear(root);
  const verdict = $('#simVerdict');
  verdict.className = 'sim-verdict loading';
  verdict.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
  const gen = ++simGen;
  const cfg = SIM[simTask], coord = simCond === 'coordinated';
  updateSimPred();
  const AX = 150, AY = [110, 188, 266], OX = 372, OY = 188, RX = 560;

  // task card
  const card = svg('g');
  card.appendChild(svg('rect', { x: 24, y: 14, width: 250, height: 54, rx: 10, fill: C.paper, stroke: C.rule, 'stroke-width': 1.5 }));
  card.appendChild(txt(svg('text', { x: 38, y: 36, fill: C.ink, 'font-size': 14, 'font-weight': 700, 'font-family': 'Inter, sans-serif' }), cfg.title + '  · ' + cfg.type));
  card.appendChild(txt(svg('text', { x: 38, y: 56, fill: C.mute, 'font-size': 11.5, 'font-family': 'Inter, sans-serif' }), cfg.constraint));
  root.appendChild(card);

  // agents
  const agentG = [];
  AY.forEach((y, k) => {
    const g = svg('g');
    g.appendChild(svg('circle', { cx: AX, cy: y, r: 26, fill: C.paper, stroke: C.ink, 'stroke-width': 2 }));
    g.appendChild(txt(svg('text', { x: AX, y: y + 5, 'text-anchor': 'middle', fill: C.ink, 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter, sans-serif' }), 'A' + (k + 1)));
    root.appendChild(g); agentG.push(g);
  });
  txt(root.appendChild(svg('text', { x: AX, y: 318, 'text-anchor': 'middle', fill: C.dim, 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' })), 'agents');

  // orchestrator (coordinated)
  let orch = null;
  if (coord) {
    orch = svg('g');
    orch.appendChild(svg('rect', { x: OX - 56, y: OY - 26, width: 112, height: 52, rx: 12, fill: C.accent, opacity: 0.12, stroke: C.accent, 'stroke-width': 2 }));
    orch.appendChild(txt(svg('text', { x: OX, y: OY + 4, 'text-anchor': 'middle', fill: C.accent, 'font-size': 12, 'font-weight': 700, 'font-family': 'Inter, sans-serif' }), 'Orchestrator'));
    root.appendChild(orch);
  }

  // result panel
  const RW = 140, RYT = 60, RH = 240;
  root.appendChild(svg('rect', { x: RX, y: RYT, width: RW, height: RH, rx: 12, fill: C.paper, stroke: C.rule, 'stroke-width': 1.5 }));
  txt(root.appendChild(svg('text', { x: RX + RW / 2, y: RYT - 10, 'text-anchor': 'middle', fill: C.dim, 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' })), 'RESULT');
  const rowsG = svg('g'); root.appendChild(rowsG);

  // meter (NM tasks)
  let meterFill = null, total = 0;
  if (cfg.meter) {
    const mY = RYT + RH - 46, mX = RX + 14, mW = RW - 28;
    root.appendChild(svg('rect', { x: mX, y: mY, width: mW, height: 12, rx: 6, fill: C.rule }));
    meterFill = svg('rect', { x: mX, y: mY, width: 0, height: 12, rx: 6, fill: C.mono });
    root.appendChild(meterFill);
    const limX = mX + (cfg.limit / cfg.max) * mW;
    root.appendChild(svg('line', { x1: limX, y1: mY - 5, x2: limX, y2: mY + 17, stroke: C.ink, 'stroke-width': 1.5 }));
    txt(root.appendChild(svg('text', { x: limX, y: mY - 9, 'text-anchor': 'middle', fill: C.mute, 'font-size': 10, 'font-family': 'JetBrains Mono, monospace' })), '$100');
    meterFill._mX = mX; meterFill._mW = mW;
  }

  function addRow(i, label, color) {
    const ry = RYT + 24 + i * 30;
    const g = svg('g', { opacity: 0 });
    g.appendChild(svg('circle', { cx: RX + 18, cy: ry, r: 4, fill: color }));
    g.appendChild(txt(svg('text', { x: RX + 32, y: ry + 4, fill: C.ink, 'font-size': 12.5, 'font-family': 'Inter, sans-serif' }), 'A' + (i + 1) + '  ' + label));
    rowsG.appendChild(g);
    requestAnimationFrame(() => { g.style.transition = 'opacity .3s ease'; g.setAttribute('opacity', 1); });
  }
  function bumpMeter(val) {
    if (!meterFill) return;
    total += val;
    const w = Math.min(total / cfg.max, 1) * meterFill._mW;
    meterFill.style.transition = 'width .4s ease, fill .3s ease';
    meterFill.setAttribute('width', w);
    if (total > cfg.limit) meterFill.setAttribute('fill', C.nm);
  }
  function pulse(g, color) {
    const c = g.querySelector('circle');
    c.style.transition = 'stroke .2s ease'; const orig = c.getAttribute('stroke');
    c.setAttribute('stroke', color); setTimeout(() => { if (gen === simGen) c.setAttribute('stroke', orig); }, 320);
  }

  const values = coord && cfg.fixedVals ? cfg.fixedVals : (cfg.claimVals || null);
  const labels = coord ? cfg.fixed : cfg.claims;
  const tk = (ms, fn) => setTimeout(() => { if (gen === simGen) fn(); }, prefersReduced ? Math.min(ms, 30) : ms);

  let t = 350;
  [0, 1, 2].forEach((i) => {
    tk(t += 520, () => pulse(agentG[i], coord ? C.accent : (cfg.type === 'NM' ? C.nm : C.mono)));
    if (coord) {
      // agent -> orchestrator
      tk(t += 120, () => flyToken(root, AX + 26, AY[i], OX - 56, OY, cfg.claims[i], C.dim, gen));
    } else {
      const col = cfg.type === 'NM' ? C.nm : C.mono;
      tk(t += 120, () => flyToken(root, AX + 26, AY[i], RX, RYT + 24 + i * 30, labels[i], col, gen, () => {
        addRow(i, labels[i], col); if (values) bumpMeter(values[i]);
      }));
    }
  });

  if (coord) {
    tk(t += 700, () => { if (orch) pulse(orch, C.accent); });
    [0, 1, 2].forEach((i) => {
      tk(t += 460, () => flyToken(root, OX + 56, OY, RX, RYT + 24 + i * 30, labels[i], C.mono, gen, () => {
        addRow(i, labels[i], C.mono); if (values) bumpMeter(values[i]);
      }));
    });
  }

  // verdict, typed out one character at a time
  tk(t += 700, () => {
    const valid = !(cfg.type === 'NM' && !coord);
    let text;
    if (valid) {
      text = !cfg.meter ? '✓ VALID — independent pieces merge by union'
        : coord ? '✓ VALID — reconciled to $100' : '✓ VALID';
    } else {
      text = '✗ INVALID — agents claimed $120, over the $100 budget';
    }
    verdict.className = 'sim-verdict ' + (valid ? 'ok' : 'bad');
    verdict.textContent = '';
    const chars = [...text];
    chars.forEach((_, i) => {
      setTimeout(() => { if (gen === simGen) verdict.textContent = chars.slice(0, i + 1).join(''); },
        prefersReduced ? 0 : i * 22);
    });
  });
}

function updateSimPred() {
  const nm = SIM[simTask].type === 'NM';
  $$('.bs-pred').forEach((g) => {
    const valid = !(nm && g.dataset.cond === 'uncoordinated');
    g.textContent = valid ? '✓' : '✗';
    g.className = 'bs-pred ' + (valid ? 'ok' : 'bad');
  });
}

function setupSim() {
  updateSimPred();
  $$('.seg[data-task]').forEach((b) => b.addEventListener('click', () => {
    $$('.seg[data-task]').forEach((x) => x.classList.remove('is-on')); b.classList.add('is-on');
    simTask = b.dataset.task; playSim();
  }));
  $$('.big-seg').forEach((b) => b.addEventListener('click', () => {
    $$('.big-seg').forEach((x) => x.classList.remove('is-on')); b.classList.add('is-on');
    simCond = b.dataset.cond; playSim();
  }));
  $('#simReplay').addEventListener('click', playSim);
  // play once the stage scrolls into view
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { playSim(); obs.unobserve(e.target); } }), { threshold: 0.3 });
  obs.observe($('#simSvg'));
}

/* ===========================================================
   4. COUNT-UP STATS
   =========================================================== */
function setupStats() {
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } }), { threshold: 0.6 });
  $$('.stat-num').forEach((n) => obs.observe(n));
}
function countUp(node) {
  const to = +node.dataset.to;
  if (prefersReduced) { node.textContent = to; return; }
  const dur = 1100; let start = null;
  (function step(t) { if (start === null) start = t; const p = Math.min((t - start) / dur, 1); node.textContent = Math.round((1 - Math.pow(1 - p, 3)) * to); if (p < 1) requestAnimationFrame(step); })(now());
}

/* ===========================================================
   5. PREVALENCE BAR CHART — APQC / O*NET toggle
   =========================================================== */
const APQC = {
  avg: 73.8, avgLabel: 'avg 74%', height: 380,
  color: (v) => v >= 67 ? C.mono : (v >= 50 ? C.order : C.nm),
  rows: [
    ['Risk & Compliance', 100], ['Vision & Strategy', 80], ['Products & Services', 80],
    ['Marketing & Sales', 80], ['Service Delivery', 80], ['Customer Service', 80],
    ['Assets', 75], ['External Relations', 75], ['Business Capabilities', 75],
    ['Human Capital', 67], ['Information Technology', 67], ['Physical Products', 60],
    ['Financial Resources', 57]
  ]
};
const ONET = {
  avg: 41, avgLabel: 'avg 41%', height: 560,
  color: (v) => v >= 45 ? C.mono : (v >= 38 ? C.order : C.nm),
  rows: [
    ['Life, Physical & Social Sci.', 52], ['Sales & Related', 50], ['Community & Social Svc', 50],
    ['Healthcare Support', 48], ['Personal Care & Service', 47], ['Office & Admin Support', 44],
    ['Healthcare Practitioners', 44], ['Business & Financial Ops', 43], ['Protective Service', 42],
    ['Building & Grounds', 42], ['Farming, Fishing, Forestry', 42], ['Production', 42],
    ['Arts, Design, Media', 40], ['Transportation', 40], ['Food Prep & Serving', 40],
    ['Construction & Extraction', 40], ['Computer & Mathematical', 40], ['Installation & Repair', 38],
    ['Architecture & Engineering', 38], ['Educational Instruction', 36], ['Legal', 33], ['Management', 32]
  ]
};
let corpus = 'apqc';
function drawBars(data) {
  const root = $('#barSvg'); clear(root);
  const W = 720, H = data.height, padL = 188, padR = 50, padT = 18, padB = 26;
  root.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const plotW = W - padL - padR, n = data.rows.length;
  const rowH = (H - padT - padB) / n;
  const xFor = (v) => padL + (v / 100) * plotW;
  [0, 25, 50, 75, 100].forEach((g) => {
    const x = xFor(g);
    root.appendChild(svg('line', { x1: x, y1: padT, x2: x, y2: H - padB, stroke: C.rule, 'stroke-width': g === 0 ? 1.5 : 1, 'stroke-dasharray': g === 0 ? '' : '2 4' }));
    txt(root.appendChild(svg('text', { x, y: H - 8, 'text-anchor': 'middle', class: 'bar-axis' })), g + '%');
  });
  const avgX = xFor(data.avg);
  root.appendChild(svg('line', { x1: avgX, y1: padT - 4, x2: avgX, y2: H - padB, stroke: C.accent, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }));
  txt(root.appendChild(svg('text', { x: avgX, y: padT - 6, 'text-anchor': 'middle', fill: C.accent, 'font-size': 11, 'font-family': 'JetBrains Mono, monospace' })), data.avgLabel);
  data.rows.forEach(([label, val], k) => {
    const y = padT + k * rowH + rowH * 0.16, h = rowH * 0.64;
    const color = data.color(val);
    txt(root.appendChild(svg('text', { x: padL - 12, y: y + h * 0.74, 'text-anchor': 'end', class: 'bar-label' })), label);
    const bar = svg('rect', { x: padL, y, width: 0, height: h, rx: 3, fill: color, opacity: 0.92 });
    root.appendChild(bar);
    const pct = svg('text', { x: padL + 6, y: y + h * 0.74, class: 'bar-pct', opacity: 0 });
    txt(pct, val + '%'); root.appendChild(pct);
    bindTip(bar, `${label}: ${val}% monotonic`);
    setTimeout(() => {
      bar.style.transition = 'width .6s cubic-bezier(.4,0,.2,1)';
      bar.setAttribute('width', xFor(val) - padL);
      pct.setAttribute('x', xFor(val) + 6); pct.style.transition = 'opacity .4s ease .25s'; pct.setAttribute('opacity', 1);
    }, prefersReduced ? 0 : 100 + k * 38);
  });
}
function markStat() {
  $$('.stat').forEach((s) => s.classList.toggle('is-dim', s.dataset.corpus !== corpus));
}
function setupBars() {
  $$('.seg-pill').forEach((b) => b.addEventListener('click', () => {
    $$('.seg-pill').forEach((x) => x.classList.remove('is-on')); b.classList.add('is-on');
    corpus = b.dataset.corpus; drawBars(corpus === 'apqc' ? APQC : ONET); markStat();
  }));
  markStat();
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { drawBars(APQC); obs.unobserve(e.target); } }), { threshold: 0.15 });
  obs.observe($('#barSvg'));
}

/* ===========================================================
   6. SIDE-NAV SCROLL SPY + copy
   =========================================================== */
function setupSideNav() {
  const links = $$('.side-nav a');
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
  buildHero(); setupExplorer(); setupSim(); setupStats(); setupBars(); setupSideNav(); setupCopy();
});
