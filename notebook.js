/* Pocket OS · virtual A6 notebook
   - 42 leaves: front cover, 40 paper leaves (pages 1–80), back cover
   - 3D page turns (click, keyboard, drag/swipe), spread or single-page view
   - Page content comes from notebook-pages.js (window.NOTEBOOK)            */
(function () {
  'use strict';

  var W = 420, H = 592;             // design size: 4 px per mm (105 × 148 mm)
  var ROW = 20;                     // 5 mm dot pitch
  var N = 42;                       // leaves
  var DATA = window.NOTEBOOK;
  var SIGNATURE = 16;               // pages per sewn signature

  var stage = document.getElementById('stage');
  var view = document.getElementById('view');
  var book = document.getElementById('book');
  var blockL = document.getElementById('blockL');
  var blockR = document.getElementById('blockR');
  var label = document.getElementById('where');
  var about = document.getElementById('about');
  var jump = document.getElementById('jump');
  var btnPrev = document.getElementById('prev');
  var btnNext = document.getElementById('next');

  var leaves = [];
  var flipped = 0;                  // number of leaves turned to the left
  var side = 'R';                   // single-page mode: which half is shown
  var single = false;
  var scale = 1;

  /* ---------- deterministic jitter so the handwriting is stable ---------- */
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }

  /* ---------- inline markup ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var G = {
    '→': '<svg class="g ar" viewBox="0 0 16 10"><path d="M1 5.3h13M9.5 1.2 14.3 5.2 9.3 9"/></svg>',
    '←': '<svg class="g ar" viewBox="0 0 16 10"><path d="M15 4.8H2M6.5 1 1.7 5 6.7 9"/></svg>',
    '↔': '<svg class="g ar2" viewBox="0 0 22 10"><path d="M2 5.2h18M6 1.4 1.6 5.1 6.2 8.8M16 1.2l4.4 4-4.3 3.7"/></svg>',
    '○': '<svg class="g ci" viewBox="0 0 12 12"><path d="M6.4 1.3C3.4 1 1.3 3.2 1.4 6.1c.1 2.8 2.2 4.6 4.8 4.5 2.7-.1 4.5-2.2 4.4-4.8C10.5 3.1 8.6 1.4 6 1.5"/></svg>'
  };
  function inline(s) {
    s = esc(s);
    s = s.replace(/~~(.+?)~~/g, '<s>$1</s>')
         .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
         .replace(/__(.+?)__/g, '<u>$1</u>');
    return s.replace(/[→←↔○]/g, function (c) { return G[c]; });
  }

  // grid marks are drawn centred on the dots, like a pen tip on the grid
  var MARKS = {
    '•': '<i class="b"></i>',
    '×': '<svg class="m" viewBox="0 0 12 12"><path d="M2.2 2.6 9.6 9.8M9.4 2 2.6 9.6"/></svg>',
    '>': '<svg class="m" viewBox="0 0 12 12"><path d="M3.5 2.2 9 6.1 3.2 9.8"/></svg>',
    '<': '<svg class="m" viewBox="0 0 12 12"><path d="M8.5 2.2 3 6.1 8.8 9.8"/></svg>',
    '-': '<i class="b"></i><svg class="m" viewBox="0 0 12 12"><path d="M1.5 10.5 10.5 1.5"/></svg>'
  };
  function gridCells(spec) {
    var out = '';
    for (var i = 0; i < 7; i++) {
      var c = spec.charAt(i);
      if (c === 'x') c = '×';
      if (/[A-Z]/.test(c)) out += '<span class="c d">' + c + '</span>';
      else out += '<span class="c">' + (MARKS[c] || '') + '</span>';
    }
    return '<span class="grid">' + out + '</span>';
  }

  function renderBody(text, seed) {
    var lines = text.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
    var r = rng(seed * 7919 + 13);
    var html = '';
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var rot = (r() - .5) * 1.1, dx = (r() - .5) * 2.4, op = .86 + r() * .12;
      var style = 'transform:translateX(' + dx.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg);opacity:' + op.toFixed(2);
      var m;
      if ((m = raw.match(/^@@(\w+):(\d+)/))) {                // sketch block
        var rows = +m[2];
        var fn = DATA.sketches[m[1]];
        html += '<div class="sk" style="height:' + rows * ROW + 'px"><svg viewBox="0 0 360 ' + rows * ROW +
          '" width="360" height="' + rows * ROW + '">' + (fn ? fn() : '') + '</svg></div>';
        continue;
      }
      if (raw.trim() === '') { html += '<div class="ln"></div>'; continue; }
      if (raw.trim() === '---') { html += '<div class="ln rule" style="' + style + '"></div>'; continue; }
      var indent = raw.match(/^ */)[0].length;
      var s = raw.slice(indent);
      var cls = 'ln', pre = '';
      if ((m = s.match(/^\{(\w)\}/))) { pre += '<i class="pt">' + m[1] + '</i>'; s = s.slice(m[0].length); }
      if (s.indexOf('## ') === 0) { cls += ' dt'; s = s.slice(3); }
      else if (s.indexOf('# ') === 0) { cls += ' h'; s = s.slice(2); }
      if ((m = s.match(/^\[([^\]]{7})\] ?/))) { pre += gridCells(m[1]); s = s.slice(m[0].length); cls += ' gl'; }
      var parts = s.split('\t');
      var body = '<span class="l">' + inline(parts[0]) + '</span>';
      if (parts.length > 1) body += '<span class="r">' + inline(parts.slice(1).join(' ')) + '</span>';
      html += '<div class="' + cls + '" style="padding-left:' + (indent * 10) + 'px;' + style + '">' + pre + body + '</div>';
    }
    return html;
  }

  /* ---------- faces ---------- */
  function pageFace(n) {
    var p = DATA.pages[n] || { body: '' };
    var left = n % 2 === 0;
    var el = document.createElement('div');
    el.className = 'face paper ' + (left ? 'lp' : 'rp');
    var num = p.s ? 'S' + p.s : (n <= DATA.front ? String(n) : '');
    var h = '<div class="content">' + renderBody(p.body, n) + '</div>';
    if (num) h += '<span class="pn">' + num + '</span>';
    // thread at the centre of each sewn signature
    var inSig = (n - 1) % SIGNATURE;
    if ((left && inSig === SIGNATURE / 2 - 1) || (!left && inSig === SIGNATURE / 2)) h += '<span class="thread"></span>';
    h += '<span class="shade"></span>';
    el.innerHTML = h;
    return el;
  }
  function coverFace(key) {
    var p = DATA.covers[key];
    var el = document.createElement('div');
    el.className = 'face kraft ' + key;
    var h = p.html || '';
    if (p.body) h += '<div class="content">' + renderBody(p.body, key.length * 101) + '</div>';
    h += '<span class="shade"></span>';
    el.innerHTML = h;
    return el;
  }

  function build() {
    for (var i = 0; i < N; i++) {
      var leaf = document.createElement('div');
      leaf.className = 'leaf';
      var front, back;
      if (i === 0) { front = coverFace('front'); back = coverFace('ifc'); leaf.classList.add('cover'); }
      else if (i === N - 1) { front = coverFace('ibc'); back = coverFace('back'); leaf.classList.add('cover'); }
      else { front = pageFace(2 * i - 1); back = pageFace(2 * i); }
      front.classList.add('front'); back.classList.add('back');
      leaf.appendChild(front); leaf.appendChild(back);
      book.appendChild(leaf);
      leaves.push(leaf);
      setLeaf(i, false, true);
    }
  }

  /* ---------- leaf state ----------
     Every leaf has an angle a (0 = resting on the right, 180 = on the left).
     Turns are driven frame by frame so lighting, the shadows cast on the pages
     underneath, and dragging all follow the page's real position.

     Only the leaves around the open spread (and any in motion) are rendered:
     84 full-size 3D layers would exhaust memory on phones.                    */
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TURN = REDUCED ? 160 : 780;      // one page turn, ms
  var anims = {};                      // leaf index -> running animation
  var rafId = 0;
  var castEdge = document.getElementById('castEdge');
  var castSpine = document.getElementById('castSpine');
  var panDur = 0;

  function bezier(x1, y1, x2, y2) {
    return function (t) {
      var u = t;
      for (var k = 0; k < 8; k++) {
        var x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
        var d = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
        if (Math.abs(x) < 1e-5 || Math.abs(d) < 1e-6) break;
        u = Math.max(0, Math.min(1, u - x / d));
      }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
  }
  var EASE_TURN = bezier(.45, .02, .18, 1);   // lifts gently, travels, lands softly
  var EASE_OUT = bezier(.15, .55, .25, 1);    // finishing a drag: keep the hand's speed

  function refresh() {
    for (var i = 0; i < N; i++) {
      var lf = leaves[i];
      var near = i >= flipped - 2 && i <= flipped + 1;
      lf.classList.toggle('off', !(near || lf._busy || lf._drag));
    }
  }

  /* Show exactly one face per leaf. backface-visibility alone is not enough on
     WebKit (all iOS browsers): transformed children of a hidden back face still
     paint, so the turned page showed through mirrored.                       */
  function showBack(leaf, on) { if (leaf._sb !== on) { leaf._sb = on; leaf.classList.toggle('sb', on); } }

  function baseZ(i, isFlipped) { return isFlipped ? 10 + i : 10 + N - i; }

  function render(i) {
    var lf = leaves[i], a = lf._a;
    lf.style.transform = 'perspective(2000px) rotateY(' + (-a).toFixed(2) + 'deg)';
    lf.style.setProperty('--s', Math.sin(a * Math.PI / 180).toFixed(3));
    showBack(lf, a > 90);
  }

  // shadows thrown by the most lifted moving leaf onto the pages underneath
  function shadows() {
    var best = -1, bs = 0.015;
    for (var i = 0; i < N; i++) {
      var lf = leaves[i];
      if (!(lf._busy || lf._drag)) continue;
      var sv = Math.sin(lf._a * Math.PI / 180);
      if (sv > bs) { bs = sv; best = i; }
    }
    if (best < 0) { castEdge.style.opacity = 0; castSpine.style.opacity = 0; return; }
    var a = leaves[best]._a, c = Math.cos(a * Math.PI / 180), xe = W + W * c;
    var w = 18 + 70 * bs, ws = 40 + 120 * bs;
    if (a <= 90) {
      // page lifting off the right: shadow on the page being revealed, just past its edge
      var we = Math.min(w, 2 * W - xe);
      castEdge.className = 'cast toR';
      castEdge.style.left = xe + 'px'; castEdge.style.width = Math.max(0, we) + 'px';
      castSpine.className = 'cast toL';
      castSpine.style.left = (W - ws) + 'px'; castSpine.style.width = ws + 'px';
    } else {
      var wl = Math.min(w, xe);
      castEdge.className = 'cast toL';
      castEdge.style.left = (xe - wl) + 'px'; castEdge.style.width = Math.max(0, wl) + 'px';
      castSpine.className = 'cast toR';
      castSpine.style.left = W + 'px'; castSpine.style.width = ws + 'px';
    }
    castEdge.style.opacity = (0.95 * bs).toFixed(3);
    castSpine.style.opacity = (0.55 * bs).toFixed(3);
  }

  function tick(now) {
    rafId = 0;
    var running = false;
    for (var k in anims) {
      var an = anims[k], i = +k, lf = leaves[i];
      var t = (now - an.t0) / an.dur;
      if (t < 0) { running = true; continue; }
      if (t >= 1) t = 1;
      lf._a = an.from + (an.to - an.from) * an.ease(t);
      render(i);
      if (t >= 1) { delete anims[k]; settle(i); } else running = true;
    }
    shadows();
    if (running) rafId = requestAnimationFrame(tick);
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(tick); }

  function settle(i) {
    var lf = leaves[i];
    lf._busy = false;
    if (!lf._drag) lf.style.zIndex = lf._peek ? 1000 + N - i : baseZ(i, lf._f);
    refresh();
  }

  function animate(i, to, dur, ease, delay) {
    var lf = leaves[i];
    lf._busy = true;
    lf.classList.remove('off');
    lf.style.zIndex = 1000 + (to > 90 ? i : N - i);
    anims[i] = { from: lf._a, to: to, t0: performance.now() + (delay || 0), dur: dur, ease: ease };
    kick();
  }

  function setLeaf(i, toFlipped, instant, dur, delay, ease) {
    var leaf = leaves[i];
    leaf._f = toFlipped;
    leaf._peek = false;
    if (instant) {
      delete anims[i];
      leaf._busy = false;
      leaf._a = toFlipped ? 180 : 0;
      leaf.style.zIndex = baseZ(i, toFlipped);
      render(i);
      return;
    }
    var heavy = i === 0 || i === N - 1;          // the kraft boards swing a bit slower
    animate(i, toFlipped ? 180 : 0, (dur || TURN) * (heavy && !dur ? 1.15 : 1), ease || EASE_TURN, delay);
  }

  function applyFlipped(target) {
    target = Math.max(0, Math.min(N, target));
    var from = flipped;
    if (target === from) { update(); return; }
    var MAXA = 5;                                  // long jumps: riffle the last few
    if (Math.abs(target - from) > MAXA) {
      var mid = target > from ? target - MAXA : target + MAXA;
      for (var q = 0; q < N; q++) if (!leaves[q]._busy || (q < mid) !== leaves[q]._f) setLeaf(q, q < mid, true);
      from = mid;
      flipped = mid;
      refresh();
    }
    var steps = Math.abs(target - from);
    var dur = steps > 1 ? (REDUCED ? 140 : 560) : TURN;
    var gap = steps > 1 ? (REDUCED ? 30 : 85) : 0;
    var k = 0;
    if (target > from) for (var i = from; i < target; i++) setLeaf(i, true, false, steps > 1 ? dur : 0, k++ * gap);
    else for (var j = from - 1; j >= target; j--) setLeaf(j, false, false, steps > 1 ? dur : 0, k++ * gap);
    // leaves still flying from an earlier, interrupted turn: send them home
    var lo = Math.min(from, target), hi = Math.max(from, target);
    for (var z = 0; z < N; z++) {
      if (z >= lo && z < hi) continue;
      if (leaves[z]._f !== (z < target) || (leaves[z]._busy && !leaves[z]._peek)) setLeaf(z, z < target, false, 320, 0, EASE_OUT);
    }
    flipped = target;
    panDur = steps > 1 ? dur + gap * (steps - 1) : TURN;
    refresh();
    update();
  }

  // desktop: the page corner lifts a little under the mouse, inviting a turn
  var peeked = -1;
  function peek(i) {
    if (peeked === i) return;
    if (peeked >= 0) {
      var p = leaves[peeked];
      if (p._peek && !p._drag) { p._peek = false; animate(peeked, p._f ? 180 : 0, 260, EASE_OUT); }
    }
    peeked = i;
    if (i >= 0) {
      var lf = leaves[i];
      if (lf._busy || lf._drag) { peeked = -1; return; }
      lf._peek = true;
      animate(i, lf._f ? 170 : 10, 300, EASE_OUT);
    }
  }

  /* ---------- what is visible ---------- */
  function leftName(f) {
    if (f === 0) return null;
    if (f === 1) return 'Inside front cover';
    if (f === N) return 'Back cover';
    return pageName(2 * (f - 1));
  }
  function rightName(f) {
    if (f === 0) return 'Cover';
    if (f === N) return null;
    if (f === N - 1) return 'Inside back cover';
    return pageName(2 * f - 1);
  }
  function pageName(n) {
    var p = DATA.pages[n] || {};
    return p.s ? 'S' + p.s + ' · p' + n : 'p' + n;
  }
  function aboutFor(f, which) {
    if (which === 'L') {
      if (f === 1) return DATA.covers.ifc.about;
      if (f === N) return DATA.covers.back.about;
      return (DATA.pages[2 * (f - 1)] || {}).about;
    }
    if (f === 0) return DATA.covers.front.about;
    if (f === N - 1) return DATA.covers.ibc.about;
    return (DATA.pages[2 * f - 1] || {}).about;
  }

  function update() {
    var L = leftName(flipped), R = rightName(flipped);
    if (single) {
      if (side === 'L' && !L) side = 'R';
      if (side === 'R' && !R) side = 'L';
    }
    var tx;
    if (single) tx = side === 'R' ? -W : 0;
    else tx = flipped === 0 ? -W / 2 : flipped === N ? W / 2 : 0;
    book.style.transition = panDur ? 'transform ' + panDur + 'ms cubic-bezier(.45,.02,.18,1)' : 'none';
    book.style.transform = 'translateX(' + tx + 'px)';
    panDur = 480;

    var txt, ab;
    if (single) {
      txt = side === 'R' ? R : L;
      ab = aboutFor(flipped, side);
    } else {
      txt = L && R ? L + ' – ' + R.replace(/^p/, '') : (L || R);
      if (L && R && /S\d/.test(L + R)) txt = L + ' · ' + R;
      var a1 = L ? aboutFor(flipped, 'L') : '', a2 = R ? aboutFor(flipped, 'R') : '';
      ab = a1 && a2 && a1 !== a2 ? a1 + '  ·  ' + a2 : (a1 || a2);
    }
    caption(txt, ab || '');
    btnPrev.disabled = flipped === 0 && (!single || side === 'R');
    btnNext.disabled = flipped === N && (!single || side === 'L');

    // page-block thickness on each side
    var t = 7;
    blockL.style.display = flipped > 0 ? '' : 'none';
    blockR.style.display = flipped < N ? '' : 'none';
    blockL.style.setProperty('--t', (1 + t * flipped / N).toFixed(1) + 'px');
    blockR.style.setProperty('--t', (1 + t * (N - flipped) / N).toFixed(1) + 'px');

    var hash = hashFor();
    if (location.hash !== hash) history.replaceState(null, '', hash);
    syncJump();
  }

  var capT = 0;
  function caption(txt, ab) {
    if (label.textContent === txt && about.textContent === ab) return;
    if (!label.textContent) { label.textContent = txt; about.textContent = ab; return; }
    label.parentNode.classList.add('swap');
    clearTimeout(capT);
    capT = setTimeout(function () {
      label.textContent = txt; about.textContent = ab;
      label.parentNode.classList.remove('swap');
    }, 150);
  }

  /* ---------- navigation ---------- */
  function next() {
    if (single) {
      if (side === 'L' && rightName(flipped)) { side = 'R'; update(); return; }
      if (flipped < N) { side = 'L'; applyFlipped(flipped + 1); }
      return;
    }
    if (flipped < N) applyFlipped(flipped + 1);
  }
  function prev() {
    if (single) {
      if (side === 'R' && leftName(flipped)) { side = 'L'; update(); return; }
      if (flipped > 0) { side = 'R'; applyFlipped(flipped - 1); }
      return;
    }
    if (flipped > 0) applyFlipped(flipped - 1);
  }

  // target spec: 'cover' | 'ifc' | 'ibc' | 'back' | page number
  function locate(t) {
    if (t === 'cover') return { f: 0, s: 'R' };
    if (t === 'ifc') return { f: 1, s: 'L' };
    if (t === 'ibc') return { f: N - 1, s: 'R' };
    if (t === 'back') return { f: N, s: 'L' };
    var n = +t;
    if (!n || n < 1 || n > 80) return null;
    return n % 2 ? { f: (n + 1) / 2, s: 'R' } : { f: n / 2 + 1, s: 'L' };
  }
  function goTo(t, instant) {
    var loc = locate(t); if (!loc) return;
    side = loc.s;
    if (instant) {
      flipped = loc.f;
      for (var i = 0; i < N; i++) setLeaf(i, i < flipped, true);
      refresh();
      panDur = 0;
      update();
    } else applyFlipped(loc.f);
    if (instant || loc.f === flipped) update();
  }
  function hashFor() {
    var f = flipped, s = single ? side : (flipped === 0 ? 'R' : 'L');
    if (f === 0) return '#cover';
    if (f === N) return '#back';
    if (s === 'L') return f === 1 ? '#ifc' : '#p' + 2 * (f - 1);
    return f === N - 1 ? '#ibc' : '#p' + (2 * f - 1);
  }
  function fromHash() {
    var h = location.hash.replace('#', '');
    if (!h) return 'cover';
    if (/^p\d+$/.test(h)) return h.slice(1);
    if (/^s\d+$/i.test(h)) return String(81 - +h.slice(1));
    return h;
  }

  /* ---------- jump menu ---------- */
  function buildJump() {
    DATA.toc.forEach(function (e) {
      var o = document.createElement('option');
      o.value = e[1]; o.textContent = e[0];
      jump.appendChild(o);
    });
    jump.addEventListener('change', function () {
      if (jump.value) goTo(jump.value);
    });
  }
  function syncJump() {
    // keep the select showing its placeholder; it's a launcher, not a state
    jump.value = '';
  }

  /* ---------- layout ---------- */
  function layout() {
    var r = stage.getBoundingClientRect();
    var aw = r.width, ah = r.height;
    single = aw / ah < 1.12 || aw < 560;
    var vw = single ? W : 2 * W;
    scale = Math.min((aw - (single ? 14 : 40)) / vw, (ah - 24) / H);
    view.style.width = vw + 'px';
    view.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(4) + ')';
    view.classList.toggle('single', single);
    if (single) {
      // pick the side matching what was on the right in spread view
      if (flipped === 0) side = 'R';
      else if (flipped === N) side = 'L';
    }
    panDur = 0;
    update();
  }

  /* ---------- pointer: tap, drag, hover ---------- */
  var drag = null;
  function bookX(clientX) {                 // pointer x in book coordinates
    var r = book.getBoundingClientRect();
    return (clientX - r.left) / scale;
  }
  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest('button,select,a')) return;
    drag = { x0: e.clientX, y0: e.clientY, moved: false, leaf: -1, dir: 0, off: 0,
             hist: [[performance.now(), e.clientX]] };
  }
  function pointerMove(e) {
    if (!drag) {
      if (e.pointerType === 'mouse' && !single) hover(e);
      return;
    }
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    drag.hist.push([performance.now(), e.clientX]);
    if (drag.hist.length > 6) drag.hist.shift();
    if (!drag.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      drag.moved = true;
      drag.dir = dx < 0 ? 1 : -1;
      if (drag.dir > 0) { if (!(single && side === 'L') && flipped < N) drag.leaf = flipped; }
      else if (!(single && side === 'R') && flipped > 0) drag.leaf = flipped - 1;
      if (drag.leaf >= 0) {
        var lf = leaves[drag.leaf];
        delete anims[drag.leaf];
        lf._drag = true; lf._busy = false; lf._peek = false; peeked = -1;
        lf.style.zIndex = 3000;
        lf.classList.remove('off');
        var under = drag.dir > 0 ? drag.leaf + 1 : drag.leaf - 1;
        if (leaves[under]) leaves[under].classList.remove('off');
        // keep the page edge where it is under the finger, no jump on pickup
        var edge = W + W * Math.cos(lf._a * Math.PI / 180);
        drag.off = edge - bookX(drag.x0);
      }
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (drag.leaf < 0) return;
    // the page's free edge follows the finger: edge x = W + W·cos(a)
    var c = Math.max(-1, Math.min(1, (bookX(e.clientX) + drag.off - W) / W));
    var lf2 = leaves[drag.leaf];
    lf2._a = Math.acos(c) * 180 / Math.PI;
    render(drag.leaf);
    shadows();
    e.preventDefault();
  }
  function pointerUp(e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.moved) { tap(e); return; }
    if (d.leaf < 0) { if (d.dir > 0) next(); else prev(); return; }
    var h = d.hist, v = 0;
    if (h.length > 1) v = (h[h.length - 1][1] - h[0][1]) / Math.max(1, h[h.length - 1][0] - h[0][0]);
    var lf = leaves[d.leaf], a = lf._a;
    var progress = d.dir > 0 ? a / 180 : (180 - a) / 180;
    var flick = d.dir > 0 ? v < -0.35 : v > 0.35;
    var back = d.dir > 0 ? v > 0.35 : v < -0.35;
    var commit = !back && (flick || progress > (single ? 0.28 : 0.42));
    lf._drag = false;
    var toFlipped = d.dir > 0 ? commit : !commit;
    var remain = Math.abs((toFlipped ? 180 : 0) - a) / 180;
    var dur = Math.max(200, Math.min(640, remain * (flick ? 520 : 720)));
    if (commit) {
      flipped = d.dir > 0 ? d.leaf + 1 : d.leaf;
      side = d.dir > 0 ? 'L' : 'R';
      panDur = dur;
    }
    setLeaf(d.leaf, toFlipped, false, dur, 0, EASE_OUT);
    refresh();
    update();
  }
  function cancelDrag() {
    if (drag && drag.leaf >= 0) {
      var l = leaves[drag.leaf];
      l._drag = false;
      setLeaf(drag.leaf, l._f, false, 300, 0, EASE_OUT);
    }
    drag = null;
  }
  function hover(e) {
    var x = bookX(e.clientX), r = book.getBoundingClientRect();
    var y = (e.clientY - r.top) / scale;
    var inY = y > 0 && y < H;
    var target = -1;
    if (inY && flipped < N && x > 2 * W - 46 && x < 2 * W + 8) target = flipped;
    else if (inY && flipped > 0 && x < 46 && x > -8) target = flipped - 1;
    peek(target);
  }
  function tap(e) {
    var r = stage.getBoundingClientRect();
    if (e.clientX - r.left > r.width / 2) next(); else prev();
  }

  /* ---------- init ---------- */
  build();
  refresh();
  buildJump();
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  stage.addEventListener('pointerdown', pointerDown);
  stage.addEventListener('pointermove', pointerMove, { passive: false });
  stage.addEventListener('pointerup', pointerUp);
  stage.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !drag) peek(-1); });
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') goTo('cover');
    else if (e.key === 'End') goTo('back');
  });
  window.addEventListener('resize', layout);
  window.addEventListener('hashchange', function () {
    if (location.hash !== hashFor()) goTo(fromHash());
  });
  var start = fromHash();
  layout();
  goTo(start, true);
  layout();
  // reveal once fonts are in, so the first paint isn't fallback "handwriting"
  var ready = function () { document.body.classList.add('ready'); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ready);
    setTimeout(ready, 2500);
  } else ready();
})();
