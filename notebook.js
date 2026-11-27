/* Pocket OS · virtual A6 notebook
   - 42 leaves: front cover, 40 paper leaves (pages 1–80), back cover
   - Page turns are a paper fold, like e-reader page curls: the sheet creases
     along the perpendicular bisector between its corner and the finger, the
     flap shows the reverse, and the next page is revealed underneath.
     Pure 2D (clip-path + affine transforms): no 3D layers, no WebKit
     backface bugs, cheap on phones.
   - Spread view on wide screens, single page on phones
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

  var faces = [];                   // by reading order: cover, ifc, p1 … p80, ibc, back
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
    el.innerHTML = h;
    return el;
  }
  function coverFace(key) {
    var p = DATA.covers[key];
    var el = document.createElement('div');
    el.className = 'face kraft ' + key;
    var h = p.html || '';
    if (p.body) h += '<div class="content">' + renderBody(p.body, key.length * 101) + '</div>';
    el.innerHTML = h;
    return el;
  }

  var flapWrap = document.createElement('div');   // flap + its light, with a drop shadow
  var shadeFlap = document.createElement('div');
  var shadeUnder = document.createElement('div');  // crease shadow on the revealed page
  flapWrap.id = 'flapWrap'; shadeFlap.className = 'fx'; shadeUnder.className = 'fx under';

  function build() {
    faces.push(coverFace('front'), coverFace('ifc'));
    for (var n = 1; n <= 80; n++) faces.push(pageFace(n));
    faces.push(coverFace('ibc'), coverFace('back'));
    faces.forEach(function (f) { book.appendChild(f); });
    book.appendChild(shadeUnder);
    flapWrap.appendChild(shadeFlap);
    book.appendChild(flapWrap);
  }

  /* ---------- state helpers ---------- */
  // reading index r: 0 cover, 1 inside cover, 2 = p1 … 81 = p80, 82 inside back, 83 back
  function rNow() { return single ? (side === 'R' ? 2 * flipped : 2 * flipped - 1) : (flipped < N ? 2 * flipped : 2 * N - 1); }
  function fromR(r) { return r % 2 === 0 ? { f: r / 2, s: 'R' } : { f: (r + 1) / 2, s: 'L' }; }
  function isKraft(el) { return el && el.classList.contains('kraft'); }

  function place(el, x, z) {
    el.style.display = 'block';
    el.style.transform = 'translateX(' + x + 'px)';
    el.style.clipPath = el.style.webkitClipPath = '';
    el.style.zIndex = z;
  }
  function paint() {
    for (var i = 0; i < faces.length; i++) faces[i].style.display = 'none';
    if (single) place(faces[rNow()], W, 1);
    else {
      if (flipped > 0) place(faces[2 * flipped - 1], 0, 1);
      if (flipped < N) place(faces[2 * flipped], W, 1);
    }
    flapWrap.style.display = 'none';
    shadeUnder.style.display = 'none';
  }
  function camX(f) {
    if (single) return -W;
    return f === 0 ? -W / 2 : f === N ? W / 2 : 0;
  }
  function setCam(f, dur) {
    book.style.transition = dur ? 'transform ' + dur + 'ms cubic-bezier(.45,.02,.18,1)' : 'none';
    book.style.transform = 'translateX(' + camX(f) + 'px)';
  }

  /* ---------- geometry ----------
     Turn space: the turning sheet is [0,W]×[0,H] with the spine at x = 0
     (book x = W + x). C is the grabbed corner, P where it has been pulled to.
     The crease is the perpendicular bisector of C→P.                        */
  function dot(ax, ay, bx, by) { return ax * bx + ay * by; }
  function clampP(P, C) {
    var bx = 0, by = C.y, ax = 0, ay = H - C.y;
    var dx = P.x - bx, dy = P.y - by, d = Math.hypot(dx, dy);
    if (d > W) { P = { x: bx + dx * W / d, y: by + dy * W / d }; }
    var D = Math.hypot(W, H);
    dx = P.x - ax; dy = P.y - ay; d = Math.hypot(dx, dy);
    if (d > D) { P = { x: ax + dx * D / d, y: ay + dy * D / d }; }
    return P;
  }
  // keep the part of the polygon where sign·((X−M)·n) ≤ 0
  function clipHalf(poly, M, n, sign) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var A = poly[i], B = poly[(i + 1) % poly.length];
      var da = sign * dot(A.x - M.x, A.y - M.y, n.x, n.y);
      var db = sign * dot(B.x - M.x, B.y - M.y, n.x, n.y);
      if (da <= 0) out.push(A);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        var t = da / (da - db);
        out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
      }
    }
    return out;
  }
  var RECT = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
  function fold(P, C) {
    P = clampP(P, C);
    var vx = C.x - P.x, vy = C.y - P.y, L = Math.hypot(vx, vy);
    if (L < 0.5) return null;
    var n = { x: vx / L, y: vy / L }, M = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };
    var top = clipHalf(RECT, M, n, 1);
    var F = clipHalf(RECT, M, n, -1);
    var fw = 0;
    F.forEach(function (X) { fw = Math.max(fw, dot(X.x - M.x, X.y - M.y, n.x, n.y)); });
    var md = 2 * dot(M.x, M.y, n.x, n.y);
    var reflect = function (X) {
      var k = 2 * dot(X.x - M.x, X.y - M.y, n.x, n.y);
      return { x: X.x - k * n.x, y: X.y - k * n.y };
    };
    return { n: n, M: M, top: top, F: F, flap: F.map(reflect), fw: fw, md: md };
  }
  function poly(pts, dx) {
    if (pts.length < 3) return 'polygon(0 0,0 0,0 0)';
    return 'polygon(' + pts.map(function (p) { return (p.x + dx).toFixed(1) + 'px ' + p.y.toFixed(1) + 'px'; }).join(',') + ')';
  }
  // CSS linear-gradient along unit direction g, distances measured from point O
  function grad(O, g, stops, w, h) {
    var phi = Math.atan2(g.x, -g.y);
    var Lg = Math.abs(w * Math.sin(phi)) + Math.abs(h * Math.cos(phi));
    var sx = w / 2 - g.x * Lg / 2, sy = h / 2 - g.y * Lg / 2;
    var o = dot(O.x - sx, O.y - sy, g.x, g.y);
    return 'linear-gradient(' + phi.toFixed(4) + 'rad,' + stops.map(function (st) {
      return st[1] + ' ' + (o + st[0]).toFixed(1) + 'px';
    }).join(',') + ')';
  }
  function clip(el, v) { el.style.clipPath = v; el.style.webkitClipPath = v; }

  /* ---------- a turn ----------
     Every turn is drawn as "a sheet on the right folding over to the left".
     Forward: P travels C → E.  Backward: the same picture, played E → C.   */
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TURN = REDUCED ? 180 : 720;
  var turn = null, rafId = 0;

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
  var EASE_TURN = bezier(.4, .05, .22, 1);
  var EASE_OUT = bezier(.15, .55, .25, 1);

  // target: spread → leaf count f;  single → reading index r
  function makeTurn(target, cornerTop) {
    var T = { single: single, target: target };
    var top, flap, uR, uL, fwd;
    if (single) {
      var r = rNow();
      fwd = target > r;
      top = faces[fwd ? r : target];
      uR = faces[fwd ? target : r];
      flap = top.cloneNode(true);
      flap.classList.add('reverse');
      T.clone = true;
    } else {
      var f = flipped;
      fwd = target > f;
      if (fwd) { top = faces[2 * f]; flap = faces[2 * target - 1]; uR = faces[2 * target]; uL = faces[2 * f - 1]; }
      else { top = faces[2 * target]; flap = faces[2 * f - 1]; uR = faces[2 * f]; uL = faces[2 * target - 1]; }
    }
    T.fwd = fwd; T.top = top; T.flap = flap; T.uR = uR; T.uL = uL;
    T.hard = isKraft(top) || isKraft(flap);
    var cy = cornerTop ? 0 : H;
    T.C = { x: W, y: cy };
    T.E = { x: -W, y: cy };
    T.P = fwd ? { x: T.C.x, y: cy } : { x: T.E.x, y: cy };

    for (var i = 0; i < faces.length; i++) faces[i].style.display = 'none';
    if (uL) place(uL, 0, 2);
    if (uR) place(uR, W, 2);
    place(top, W, 3);
    flapWrap.insertBefore(flap, shadeFlap);
    flap.style.display = 'block';
    flap.style.zIndex = 1;
    flapWrap.style.display = 'block';
    shadeUnder.style.display = 'block';
    flapWrap.classList.toggle('hard', T.hard);
    turn = T;
    draw();
    return T;
  }

  function draw() {
    var T = turn; if (!T) return;
    var g = fold(T.P, T.C);
    if (!g) {
      clip(T.top, ''); T.top.style.visibility = '';
      T.flap.style.visibility = 'hidden'; shadeFlap.style.visibility = 'hidden'; shadeUnder.style.visibility = 'hidden';
      return;
    }
    T.flap.style.visibility = ''; shadeFlap.style.visibility = ''; shadeUnder.style.visibility = '';
    // the part of the sheet still lying flat
    T.top.style.visibility = g.top.length < 3 ? 'hidden' : '';
    clip(T.top, poly(g.top, 0));
    // the flap: reverse side, reflected across the crease
    var n = g.n;
    var q11 = 1 - 2 * n.x * n.x, q12 = -2 * n.x * n.y, q22 = 1 - 2 * n.y * n.y;
    var tx = g.md * n.x, ty = g.md * n.y, m, fpoly;
    if (T.single) {      // paper seen from behind: same page, mirrored
      m = [q11, q12, q12, q22, tx + W, ty];
      fpoly = g.F;
    } else {             // the real reverse page, which will rest on the left
      m = [-q11, -q12, q12, q22, q11 * W + tx + W, q12 * W + ty];
      fpoly = g.F.map(function (X) { return { x: W - X.x, y: X.y }; });
    }
    T.flap.style.transform = 'matrix(' + m.map(function (v) { return v.toFixed(5); }).join(',') + ')';
    clip(T.flap, poly(fpoly, 0));

    // light on the flap: dark in the crease, a soft sheen where it bows, darker at the lip
    var M = { x: g.M.x + W, y: g.M.y }, fw = Math.max(1, g.fw);
    var sheen = T.hard ? 'rgba(255,240,215,.10)' : 'rgba(255,252,240,.26)';
    var into = { x: -n.x, y: -n.y };
    var light = grad(M, into, [
      [0, 'rgba(30,20,5,.34)'], [2, 'rgba(30,20,5,.20)'], [fw * .18, 'rgba(30,20,5,.04)'],
      [fw * .55, sheen], [fw * .92, 'rgba(30,20,5,.06)'], [fw, 'rgba(30,20,5,.16)']
    ], 2 * W, H);
    if (T.single) {
      var wash = isKraft(T.top) ? 'rgba(186,142,96,.90)' : 'rgba(246,241,228,.90)';
      light += ',linear-gradient(' + wash + ',' + wash + ')';
    }
    shadeFlap.style.background = light;
    clip(shadeFlap, poly(g.flap, W));

    // shadow along the crease on the page being revealed
    var reach = Math.min(90, 14 + fw * .45);
    shadeUnder.style.background = grad(M, n, [
      [0, 'rgba(30,20,5,.55)'], [reach * .25, 'rgba(30,20,5,.30)'], [reach, 'rgba(30,20,5,0)']
    ], 2 * W, H);
    clip(shadeUnder, poly(g.F, W));
  }

  function endTurn(commit) {
    var T = turn; if (!T) return;
    turn = null;
    T.top.style.visibility = '';
    clip(T.top, '');
    if (T.clone) T.flap.remove();
    else {
      T.flap.style.transform = ''; T.flap.style.visibility = ''; clip(T.flap, '');
      book.insertBefore(T.flap, shadeUnder);
    }
    if (commit) {
      if (T.single) { var st = fromR(T.target); flipped = st.f; side = st.s; }
      else flipped = T.target;
    }
    paint();
    update();
  }

  function animateTo(to, dur, ease, lift, done) {
    var T = turn; if (!T) return;
    T.anim = { from: { x: T.P.x, y: T.P.y }, to: to, t0: performance.now(), dur: dur, ease: ease, lift: lift || 0, done: done };
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  function tick(now) {
    rafId = 0;
    var T = turn; if (!T || !T.anim) return;
    var a = T.anim, t = Math.min(1, (now - a.t0) / a.dur), e = a.ease(t);
    var up = T.C.y === 0 ? 1 : -1;                     // a lifted corner moves away from its edge
    T.P = {
      x: a.from.x + (a.to.x - a.from.x) * e,
      y: a.from.y + (a.to.y - a.from.y) * e + up * a.lift * Math.sin(Math.PI * e)
    };
    draw();
    if (t < 1) rafId = requestAnimationFrame(tick);
    else { T.anim = null; if (a.done) a.done(); }
  }
  function finishNow() {                                 // a new request interrupts a running turn
    var T = turn; if (!T) return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    var a = T.anim;
    if (a && a.done) { T.anim = null; a.done(); }
    else if (turn) endTurn(false);
  }

  // full animated turn to a target state
  function turnTo(target, opts) {
    opts = opts || {};
    var reuse = turn && turn.peek && turn.target === target;
    if (!reuse) { finishNow(); makeTurn(target, false); }
    var T = turn;
    T.peek = false;
    var goal = T.fwd ? T.E : T.C;
    var lift = T.hard ? H * .03 : H * (opts.jump ? .10 : .16);
    var dur = opts.dur || (T.hard ? TURN * 1.15 : TURN);
    if (!T.single) setCam(T.target, dur);
    animateTo({ x: goal.x, y: goal.y }, dur, EASE_TURN, reuse ? lift * .5 : lift, function () { endTurn(true); });
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
    if (!turn) setCam(flipped, 0);

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
    if (single) {
      var r = rNow();
      blockL.style.display = 'none';
      blockR.style.display = '';
      blockR.style.setProperty('--t', (1 + t * (83 - r) / 83).toFixed(1) + 'px');
    } else {
      blockL.style.display = flipped > 0 ? '' : 'none';
      blockR.style.display = flipped < N ? '' : 'none';
      blockL.style.setProperty('--t', (1 + t * flipped / N).toFixed(1) + 'px');
      blockR.style.setProperty('--t', (1 + t * (N - flipped) / N).toFixed(1) + 'px');
    }

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
  // a request made mid-turn first lands the running turn, then reads the state
  function settle() { if (turn && !turn.peek) finishNow(); }
  function next() {
    settle();
    if (single) { var r = rNow(); if (r < 83) turnTo(r + 1); return; }
    if (flipped < N) turnTo(flipped + 1);
  }
  function prev() {
    settle();
    if (single) { var r = rNow(); if (r > 0) turnTo(r - 1); return; }
    if (flipped > 0) turnTo(flipped - 1);
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
    settle();
    if (instant) {
      finishNow();
      flipped = loc.f; side = loc.s;
      paint(); update();
      return;
    }
    if (single) {
      var r = loc.s === 'R' ? 2 * loc.f : 2 * loc.f - 1;
      if (r !== rNow()) turnTo(r, { jump: Math.abs(r - rNow()) > 1 });
    } else if (loc.f !== flipped) turnTo(loc.f, { jump: Math.abs(loc.f - flipped) > 1 });
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
  var lastW = 0, lastH = 0;
  function layout() {
    var r = stage.getBoundingClientRect();
    var aw = r.width, ah = r.height;
    if (aw === lastW && ah === lastH && turn) return;   // spurious resize: keep the turn going
    lastW = aw; lastH = ah;
    single = aw / ah < 1.12 || aw < 560;
    var vw = single ? W : 2 * W;
    scale = Math.min((aw - (single ? 14 : 40)) / vw, (ah - 24) / H);
    view.style.width = vw + 'px';
    view.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(4) + ')';
    view.classList.toggle('single', single);
    finishNow();
    if (single) {
      if (flipped === 0) side = 'R';
      else if (flipped === N) side = 'L';
    }
    paint();
    update();
  }

  /* ---------- pointer: tap, drag, corner peel ---------- */
  var drag = null;
  function toBook(e) {                     // pointer in book coordinates
    var r = book.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }
  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest('button,select,a')) return;
    var b = toBook(e);
    drag = { x0: e.clientX, y0: e.clientY, b0: b, moved: false, on: false, hist: [[performance.now(), e.clientX]] };
  }
  function pointerMove(e) {
    if (!drag) { if (e.pointerType === 'mouse' && !single) hover(e); return; }
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    drag.hist.push([performance.now(), e.clientX]);
    if (drag.hist.length > 6) drag.hist.shift();
    if (!drag.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      drag.moved = true;
      settle();
      var fwd = dx < 0, target;
      if (single) { var r = rNow(); target = fwd ? r + 1 : r - 1; if (target < 0 || target > 83) return; }
      else { target = fwd ? flipped + 1 : flipped - 1; if (target < 0 || target > N) return; }
      var cornerTop = drag.b0.y < H * .4;
      if (turn && turn.peek && turn.target === target && !!(turn.C.y === 0) === cornerTop) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        turn.anim = null;
      } else { finishNow(); makeTurn(target, cornerTop); }
      turn.peek = false;
      drag.on = true;
      drag.P0 = { x: turn.P.x, y: turn.P.y };
      drag.k = single ? 2 : 1;             // one page wide on a phone: travel twice as far
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (!drag.on || !turn) return;
    turn.P = { x: drag.P0.x + dx / scale * drag.k, y: drag.P0.y + dy / scale };
    draw();
    e.preventDefault();
  }
  function pointerUp(e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.moved) { tap(e); return; }
    if (!d.on || !turn) return;
    var T = turn;
    var h = d.hist, v = 0;
    if (h.length > 1) v = (h[h.length - 1][1] - h[0][1]) / Math.max(1, h[h.length - 1][0] - h[0][0]);
    var start = T.fwd ? T.C : T.E, goal = T.fwd ? T.E : T.C;
    var progress = (T.P.x - start.x) / (goal.x - start.x);
    var dirOk = T.fwd ? v < -0.3 : v > 0.3, against = T.fwd ? v > 0.3 : v < -0.3;
    var commit = !against && (dirOk || progress > (T.single ? .25 : .4));
    var to = commit ? goal : start;
    var dist = Math.hypot(to.x - T.P.x, to.y - T.P.y) / (2 * W);
    var dur = Math.max(180, Math.min(620, dist * (dirOk ? 560 : 760)));
    if (commit && !T.single) setCam(T.target, dur);
    animateTo({ x: to.x, y: to.y }, dur, EASE_OUT, 0, function () { endTurn(commit); });
  }
  function cancelDrag() {
    if (drag && drag.on && turn) {
      var T = turn;
      animateTo(T.fwd ? T.C : T.E, 260, EASE_OUT, 0, function () { endTurn(false); });
    }
    drag = null;
  }
  // desktop: hovering near an outer corner peels it up a little
  function hover(e) {
    var b = toBook(e), zone = 70, target = null, top = false;
    if (flipped < N && b.x > 2 * W - zone && b.x < 2 * W + 6) {
      if (b.y > H - zone && b.y < H + 6) target = flipped + 1;
      else if (b.y < zone && b.y > -6) { target = flipped + 1; top = true; }
    } else if (flipped > 0 && b.x < zone && b.x > -6) {
      if (b.y > H - zone && b.y < H + 6) target = flipped - 1;
      else if (b.y < zone && b.y > -6) { target = flipped - 1; top = true; }
    }
    if (turn && !turn.peek) return;                  // a real turn is running
    if (target === null) {
      if (turn && turn.peek && !turn.leaving) {
        var T = turn; T.leaving = true;
        animateTo(T.fwd ? T.C : T.E, 220, EASE_OUT, 0, function () { if (turn === T) endTurn(false); });
      }
      return;
    }
    if (!(turn && turn.peek && turn.target === target && (turn.C.y === 0) === top)) {
      finishNow(); makeTurn(target, top); turn.peek = true;
    }
    var T2 = turn; T2.leaving = false;
    var base = T2.fwd ? T2.C : T2.E, sx = T2.fwd ? -1 : 1, sy = top ? 1 : -1;
    // follow the mouse a little inside the zone
    var px = b.x - W, py = b.y;
    var want = { x: base.x + sx * 44 + (px - base.x) * .35, y: base.y + sy * 36 + (py - base.y) * .35 };
    animateTo(want, 140, EASE_OUT, 0, null);
  }
  function tap(e) {
    var r = stage.getBoundingClientRect();
    if (e.clientX - r.left > r.width / 2) next(); else prev();
  }

  /* ---------- init ---------- */
  build();
  buildJump();
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  stage.addEventListener('pointerdown', pointerDown);
  stage.addEventListener('pointermove', pointerMove, { passive: false });
  stage.addEventListener('pointerup', pointerUp);
  stage.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse' && !drag && turn && turn.peek) {
      var T = turn; animateTo(T.fwd ? T.C : T.E, 220, EASE_OUT, 0, function () { if (turn === T) endTurn(false); });
    }
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
