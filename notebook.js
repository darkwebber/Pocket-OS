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
  var DUR = 900;

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
     Only the leaves around the open spread (and any mid-turn) are rendered.
     Keeping 84 full-size 3D layers alive would exhaust memory on phones.  */
  function refresh() {
    for (var i = 0; i < N; i++) {
      var lf = leaves[i];
      var near = i >= flipped - 2 && i <= flipped + 1;
      lf.classList.toggle('off', !(near || lf._busy || lf._drag));
    }
  }

  function baseZ(i, isFlipped) { return isFlipped ? 10 + i : 10 + N - i; }
  function transformFor(angle) { return 'perspective(2600px) rotateY(' + angle + 'deg)'; }

  function setLeaf(i, toFlipped, instant, dur) {
    var leaf = leaves[i];
    var was = leaf._f;
    leaf._f = toFlipped;
    if (instant) {
      leaf._busy = false;
      leaf.classList.remove('turning');
      leaf.style.transition = 'none';
      leaf.style.transform = transformFor(toFlipped ? -180 : 0);
      leaf.style.zIndex = baseZ(i, toFlipped);
      leaf.offsetWidth; // flush
      leaf.style.transition = '';
      return;
    }
    if (was === toFlipped && !leaf._drag) return;
    leaf._drag = false;
    leaf._busy = true;
    leaf.classList.remove('off');
    var d = dur || DUR;
    leaf.style.transition = 'transform ' + d + 'ms cubic-bezier(.33,.08,.22,1)';
    leaf.style.zIndex = 1000 + (toFlipped ? i : N - i);
    leaf.classList.remove('turning'); leaf.offsetWidth;
    leaf.style.setProperty('--dur', d + 'ms');
    leaf.classList.add('turning');
    leaf.style.transform = transformFor(toFlipped ? -180 : 0);
    clearTimeout(leaf._t);
    leaf._t = setTimeout(function () {
      leaf.classList.remove('turning');
      leaf.style.zIndex = baseZ(i, leaf._f);
      leaf._busy = false;
      refresh();
    }, d + 30);
  }

  function applyFlipped(target, opts) {
    opts = opts || {};
    target = Math.max(0, Math.min(N, target));
    var from = flipped;
    if (target === from) { update(); return; }
    var MAXA = 5;
    if (Math.abs(target - from) > MAXA) {
      var mid = target > from ? target - MAXA : target + MAXA;
      for (var q = 0; q < N; q++) if (!leaves[q]._busy) setLeaf(q, q < mid, true);
      from = mid;
      flipped = mid;
      refresh();
    }
    var steps = Math.abs(target - from);
    var dur = steps > 1 ? Math.max(380, DUR - steps * 40) : DUR;
    var gap = steps > 1 ? Math.max(18, 110 - steps * 4) : 0;
    var k = 0;
    if (target > from) {
      for (var i = from; i < target; i++) (function (i, k) {
        setTimeout(function () { setLeaf(i, true, false, dur); }, k * gap);
      })(i, k++);
    } else {
      for (var j = from - 1; j >= target; j--) (function (j, k) {
        setTimeout(function () { setLeaf(j, false, false, dur); }, k * gap);
      })(j, k++);
    }
    flipped = target;
    refresh();
    update();
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
    book.style.transform = 'translateX(' + tx + 'px)';

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
    label.textContent = txt;
    about.textContent = ab || '';
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
    update();
  }

  /* ---------- pointer: tap and drag ---------- */
  var drag = null;
  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    drag = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, leaf: -1, dir: 0, p: 0 };
  }
  function pointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      drag.moved = true;
      drag.dir = dx < 0 ? 1 : -1;
      // which leaf would turn?
      if (drag.dir > 0) {
        if (!(single && side === 'L') && flipped < N) drag.leaf = flipped;
      } else {
        if (!(single && side === 'R') && flipped > 0) drag.leaf = flipped - 1;
      }
      if (drag.leaf >= 0) {
        var lf = leaves[drag.leaf];
        lf._drag = true;
        lf.style.transition = 'none';
        lf.style.zIndex = 3000;
        lf.classList.add('dragging');
        lf.classList.remove('off');
        var under = drag.dir > 0 ? drag.leaf + 1 : drag.leaf - 1;
        if (leaves[under]) leaves[under].classList.remove('off');
      }
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (drag.leaf < 0) return;
    var span = W * scale * (single ? 1.1 : 1.6);
    var p = Math.max(0, Math.min(1, drag.dir * -dx / span));
    drag.p = p;
    var angle = drag.dir > 0 ? -180 * p : -180 * (1 - p);
    var lf2 = leaves[drag.leaf];
    lf2.style.transform = transformFor(angle);
    lf2.style.setProperty('--p', Math.sin(p * Math.PI).toFixed(3));
    e.preventDefault();
  }
  function pointerUp(e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.moved) { tap(e); return; }
    var dt = performance.now() - d.t0;
    var v = Math.abs(e.clientX - d.x0) / Math.max(1, dt);
    var commit = d.p > 0.3 || (v > 0.45 && d.p > 0.06);
    if (d.leaf < 0) {                       // single-page pan, no leaf turns
      if (d.dir > 0) next(); else prev();
      return;
    }
    var lf = leaves[d.leaf];
    lf.classList.remove('dragging');
    lf.style.removeProperty('--p');
    var remaining = Math.round(DUR * 0.7 * (commit ? 1 - d.p : d.p)) + 120;
    if (d.dir > 0) {
      if (commit) { flipped = d.leaf + 1; side = 'L'; setLeaf(d.leaf, true, false, remaining); }
      else setLeaf(d.leaf, false, false, remaining);
    } else {
      if (commit) { flipped = d.leaf; side = 'R'; setLeaf(d.leaf, false, false, remaining); }
      else setLeaf(d.leaf, true, false, remaining);
    }
    refresh();
    update();
  }
  function tap(e) {
    if (e.target.closest && e.target.closest('button,select,a')) return;
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
  stage.addEventListener('pointercancel', function () {
    if (drag && drag.leaf >= 0) { var l = leaves[drag.leaf]; l.classList.remove('dragging'); setLeaf(drag.leaf, l._f, false, 300); }
    drag = null;
  });
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
