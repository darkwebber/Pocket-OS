/* Pocket OS · sample notebook content (volume 03, 28 Sep – 22 Nov 2026)
   Illustrative only. Work entries are references, never data (Art 16).

   Line markup (one line = one 5 mm dot row, max 26 rows per page):
     # Heading          ## Date header      ---  rule
     {a} …              point letter in the margin
     [MTWTFSS] label    7 weekday cells: · blank, • planned, × done, - struck, > moved
     text<TAB>right     right-aligned column
     ~~strike~~  **bold**  __underline__
     leading spaces     indent (2 spaces = half a dot step)
     @@name:rows        hand-drawn sketch from SKETCH, rows tall                     */
(function () {
  'use strict';

  /* ---------- sketch helpers ---------- */
  function p(d) { return '<path class="i" d="' + d + '"/>'; }
  function t(x, y, s, cls) { return '<text x="' + x + '" y="' + y + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>'; }
  function box(x, y, w, h) { return p('M' + (x + 2) + ' ' + y + 'h' + (w - 3) + 'q2 0 1.5 3v' + (h - 4) + 'q0 1.5-2 1.5H' + (x + 1) + 'q-1.5 0-1.3-2V' + (y + 2) + 'q0-2 2-2'); }
  function arrow(x1, y1, x2, y2) {
    var a = Math.atan2(y2 - y1, x2 - x1), h = 8;
    var l1 = [x2 - h * Math.cos(a - .45), y2 - h * Math.sin(a - .45)], l2 = [x2 - h * Math.cos(a + .45), y2 - h * Math.sin(a + .45)];
    return p('M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'M' + l1[0].toFixed(1) + ' ' + l1[1].toFixed(1) + 'L' + x2 + ' ' + y2 + 'L' + l2[0].toFixed(1) + ' ' + l2[1].toFixed(1));
  }
  function dot(x, y, r) { return '<circle class="f" cx="' + x + '" cy="' + y + '" r="' + (r || 2.2) + '"/>'; }

  var SKETCH = {
    gpuArch: function () {
      return box(2, 18, 92, 58) + t(16, 42, 'phone') + t(12, 64, 'browser') +
        arrow(98, 46, 140, 46) + t(102, 36, 'code', 's') +
        box(144, 18, 92, 58) + t(156, 42, 'API') + t(154, 64, '/run') +
        arrow(240, 46, 274, 46) +
        box(278, 8, 80, 78) + t(290, 32, 'Modal') + t(288, 54, 'GPU fn') + t(294, 76, 'nvcc') +
        p('M318 92C300 150 90 150 48 82') + arrow(56, 96, 48, 82) +
        t(118, 140, 'stdout + stderr back', 's') +
        p('M150 168c30-4 60 3 90-2') + t(150, 190, '?? timeouts', 's');
    },
    gridTest: function () {
      var s = '', days = 'MTWTFSS';
      for (var i = 0; i < 7; i++) s += t(i * 20 - 4, 20, days[i], 's');
      for (var r = 1; r < 4; r++) s += t(-6 + (r * 37) % 120, 20 + r * 20, '•');
      s += p('M-10 4h150v84H-10z') + t(150, 40, '← 1 row = 1 dot: cramped', 's');
      for (var j = 0; j < 7; j++) s += t(j * 30 - 4, 128, days[j]);
      s += t(30, 158, '•') + t(90, 158, '×') + t(150, 188, '•');
      s += p('M-10 108h220v96H-10z') + t(218, 150, '← 1.5 dots:', 's') + t(222, 172, 'easier', 's');
      return s;
    },
    pricing: function () {
      return t(0, 16, 'GPU options (prices approx., check)') +
        p('M0 24h250') +
        t(0, 56, 'own VM 24/7  ~ $0.5/h × 720') + t(250, 56, '= $$$') +
        t(0, 96, 'serverless   ~ $0.6/h × 20 h') + t(250, 96, '≈ $12') +
        p('M240 80c18-10 52-8 60 8s-26 22-50 12-18-18-10-20') +
        t(0, 136, '+ no idle bill  + scales to 0') +
        t(0, 156, '– cold start ~ secs (fine)') +
        arrow(0, 186, 40, 186) + t(48, 192, 'serverless. decision → @10');
    },
    desk: function () {
      return box(20, 10, 300, 150) + t(330, 90, '60', 's') +
        box(120, 22, 110, 16) + t(140, 58, 'monitor (arm)', 's') +
        box(130, 96, 90, 50) + t(146, 126, 'laptop', 's') +
        box(40, 92, 48, 62) + t(43, 86, 'book', 's') + p('M48 104h30M48 116h30M48 128h22') +
        p('M286 40c-14 0-14 22 0 22s14-22 0-22') + t(268, 84, 'lamp', 's') +
        p('M248 130l40 20') + t(244, 180, 'pen lives in the book', 's') +
        t(20, 190, 'top view', 's');
    },
    pca: function () {
      var s = arrow(10, 170, 190, 170) + arrow(20, 180, 20, 10) +
        p('M40 150C10 120 70 40 120 30 180 18 200 60 170 92 140 130 70 180 40 150z') +
        arrow(105, 100, 168, 40) + arrow(105, 100, 80, 75) + dot(105, 100, 2.5);
      s += t(150, 64, 'v1', 's') + t(58, 70, 'v2', 's');
      s += t(222, 30, 'Σ = [2 1; 1 2]') + t(222, 62, 'λ = 3, 1') + t(222, 94, 'v1 = (1,1)/√2') +
        t(222, 126, 'v2 = (1,−1)/√2') + t(222, 172, 'variance along v1', 's') + t(222, 192, '= biggest. that\'s PC1', 's');
      return s;
    },
    timeout: function () {
      return t(0, 16, 'timeout v1: kill(pid)') + p('M0 22h170') +
        box(10, 36, 70, 30) + t(18, 58, 'shell', 's') + arrow(80, 51, 120, 51) +
        box(122, 36, 70, 30) + t(132, 58, 'nvcc', 's') + arrow(192, 51, 232, 51) +
        box(234, 36, 70, 30) + t(244, 58, 'a.out', 's') +
        p('M12 30l66 40M78 30l-66 40') + t(234, 92, '← still running!!', 's') +
        t(0, 132, 'v2: start_new_session=True') + t(0, 156, 'then killpg(pgid) → all die') +
        p('M0 166c40 4 120-2 220 2') + t(0, 196, 'test: while(1){} → 10 s → gone ×');
    },
    vent: function () {
      return p('M300 30c-20-20-50 10-30 30s50-10 30-40-70-20-60 30 60 40 70 0') +
        p('M250 140c10-12 30-12 40 0M246 160c14 12 38 12 50 0') + dot(258, 130) + dot(284, 130);
    },
    packing: function () {
      return p('M300 20l20 40-40 0z') + p('M290 70v40h40v-40');
    },
    mindmap: function () {
      return p('M130 92c0-20 90-20 90 0s-90 20-90 0') + t(140, 98, 'restart costs') +
        p('M150 80L90 30') + t(20, 26, 'breadcrumbs') +
        p('M210 80L270 30') + t(250, 24, 'agent memory') +
        p('M140 108L70 150') + t(0, 168, 'FIRST: = physical') +
        p('M215 106L280 150') + t(240, 170, 'RESET > repair') +
        p('M175 112v60') + t(130, 192, 'talk? blog? → LATER', 's');
    },
    cors: function () {
      return box(0, 6, 80, 34) + t(10, 30, 'phone', 's') + arrow(82, 23, 160, 23) + t(96, 14, 'POST', 's') +
        box(162, 6, 90, 34) + t(170, 30, 'Modal fn', 's') +
        p('M200 44l-6 30M190 50l14 18') + t(150, 96, 'blocked: no Allow-Origin', 's') +
        t(0, 136, 'fix: add header in fn') + t(0, 160, '+ OPTIONS preflight → 204') + t(0, 192, 'retest from phone: ×', 's');
    },
    phone: function () {
      var s = box(20, 6, 140, 260) + box(30, 22, 120, 76) + t(38, 44, 'output', 's') +
        p('M38 56h70M38 68h50M38 80h80') +
        box(30, 108, 120, 116) + t(38, 130, 'editor', 's') +
        p('M38 144h90M48 158h70M48 172h60M38 186h40') + p('M34 196h112') +
        box(52, 232, 76, 26) + t(70, 251, 'RUN', 's');
      s += arrow(178, 60, 152, 60) + t(184, 66, 'output on top?', 's') +
        arrow(178, 245, 132, 245) + t(184, 250, 'big, thumb reach', 's') +
        arrow(178, 160, 152, 160) + t(184, 156, 'tap error →', 's') + t(184, 176, 'jump to line', 's');
      return s;
    },
    label: function () {
      return box(80, 10, 200, 110) + t(124, 50, 'POCKET OS') + p('M96 62h168') +
        t(156, 90, '04') + t(118, 112, 'Nov 2026 –', 's');
    }
  };

  /* ---------- covers ---------- */
  var MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="#3c2810" stroke-width="1.6" stroke-linecap="round"><rect x="6" y="3" width="21" height="26" rx="2.5"/><path d="M11 3v26"/><circle cx="15.5" cy="10" r="1.3" fill="#3c2810"/><path d="M19 10h5M14 15l3 3m0-3-3 3M19 16.5h5"/><circle cx="15.5" cy="23" r="1.3" fill="#3c2810"/><path d="M19 23h5"/></g></svg>';

  var covers = {
    front: {
      about: 'Kraft cover, thread-bound spine. Volume number + date range on the label (Art 15.1)',
      html: '<span class="spine"></span>' +
        '<div class="label"><span class="t">POCKET OS</span><span class="v">03</span><span class="d">28 Sep – 22 Nov 2026</span></div>' +
        MARK +
        '<div class="stamp">A6 · 105 × 148 mm<br>dot grid 5 mm · 80 pages</div>'
    },
    ifc: {
      about: 'Inside front cover · the key: the only thing copied from the docs (Art 4.1, field card)',
      body: `
# POCKET OS · vol 03
• action    × done     > moved
< deferred  ○ event    – note, idea
= feeling   ₹ spend    * priority
! insight   @ reference
~~strike~~ = cancelled

@42 = this vol, page 42
@2.67 = vol 2, page 67
@2.67a = entry a on that page
@S3 = 3rd scratch page from back
@SB:Title = SilverBullet note
↔ = linked both ways
W43 = week 43    CAL = calendar
grid:  • planned   × done   ~~•~~ moved

Capture first. One home per action.
Link, don't copy.
Continue, don't reserve.
Calendar owns timed commitments.
Leave NEXT: when stopping.
Missed days: restart, then rescue.

Labels: FIRST: NEXT: PAUSE RESUME
        WAIT: — plain words.`
    },
    ibc: {
      about: 'Inside back cover · if found + privacy boundary (Art 16)',
      body: `




      IF FOUND — please return.
      reward + a thank-you chai.



RULES FOR THIS BOOK
– no passwords, no keys, no PINs
– no customer or company data
– work = references only:
    "tracker ANL-2xx", not numbers
– private stuff stays at home

vol 03 · 28 Sep – 22 Nov 2026
front 1–68 · scratch S1–S12`
    },
    back: {
      about: 'Back cover · retired volumes shelve in order; addresses stay permanent (Art 15)',
      html: '<span class="spine"></span><div class="stamp">kraft · thread sewn · lay-flat<br>A6 · 80 pages · dot grid</div>'
    }
  };

  /* ---------- pages ---------- */
  var pages = {};
  function P(n, about, body, s) { pages[n] = { about: about, body: body, s: s }; }

  P(1, 'p1 · Index: active directory (where live state is) + selective topic index (Art 10.3–10.4)', `
# INDEX
ACTIVE DIRECTORY
GPU  CUDA Playground	~~10~~ → 42 → @4.6
   └ backend	17 [done]
   └ mobile editor	61 → @4.7
ANL  Retention (work)	7 → @4.8
HOME Desk setup	21 [done 19 Nov]
SCH  Schrollar	@2.23 [parked]
LATER	2–3 → 50
---
TOPICS
Restart costs	29, 12b, @2.67a
PCA / lin. algebra	25a, S5
GPU pricing	S3, @2.41
Evening energy	27a, 49
Spending patterns	28, 49a
Experiments	22, 30, 51
Reviews	12, 20, 27, 35, 48, 65
System friction	13, 39, 49
Day-30 check	39
Monthly · Oct	49
Transition → vol 04	66–67

– index only what I'd want to find
  again without a date. not all.`);

  P(2, 'pp2–3 · Later: – idea, • real but not now. Items leave with > (moved), × (done) or a strike (dropped) (Art 5.1, 5.3)', `
# LATER
ideas + someday. not a to-do list.
– Learn Triton basics
– Rewrite blog about/ page
> Bike service → W43 @31
– Try sourdough again (winter?)
× Return old library card
– Read DDIA ch. 5–6
> Photo backup → W43 @31
~~– Build my own habit app~~
    tooling freeze. no.
– Goa trip with family?
> Standing desk? → HOME @21
– Vol catalogue in SB — only if
    retrieval actually hurts
– Basic Tamil phrases
– 10-min stretch routine
– Second-hand film camera?
– Open-source the CUDA lab
    (after it works end-to-end)
× Cancel unused streaming sub
> "Notes on restarting work" → @4.2
    ← from topic @29`);

  P(3, 'pp2–3 · Later fills, then threads on to p50 instead of squeezing (Art 7.2)', `
– Visit the planetarium
> Sort cables drawer → HOME @21
– Re-read "Deep Work"?
~~• Learn Rust this month~~
    honest: not a priority
– SilverBullet queries — explore
< Call w/ ex-colleague CAL 10 Nov
    (mentor call)
× Fix squeaky door hinge
> Donate old clothes → @4.2
> SIP review → @4.2
    use real bank statements,
    not the ₹ lines
– Cook 2 new dishes / month
– Learn to sharpen kitchen knife
– Small balcony plant?
– Weekend trek, Jan
> Bookshelf for floor pile → @4.2
– Re-learn basic piano



LATER continued @50 →`);

  P(4, 'pp4–5 · Weekly spread, left: lead outcomes, fixed events (calendar owns them), waiting (Art 8.1)', `
# WEEK 40 · 28 SEP – 4 OCT
first week of vol 03 — keep it small

Lead work: ANL baseline @7
Lead personal: start GPU playground

Fixed (CAL owns these):
○ Tue 11:00 team sync
○ Thu 19:00 dinner w/ cousins

Waiting:
WAIT: data access (@7) — chk Wed

Themes: just open the book daily.









– 1 lead work + 1 lead personal.
  everything else is maintenance.`);

  P(5, 'pp4–5 · Alastair grid: • planned day, × done day; the row itself shows the outcome (Art 8.2)', `
[MTWTFSS] STANDALONE
[••×····] × Expense claim (Sep)
[·×·····] × Pay electricity bill
[···•-··] < Bike service LATER
[·····×·] × Groceries
[·····×·] × Laundry
[·•·×···] × Reply landlord re: tap

[MTWTFSS] PROJECT SESSIONS
[××××···] ANL @7
[····××·] GPU @10

– a session × ≠ project done.
  the project page owns that.

– FRICTION: grid cramped with my
  handwriting → test @S2`);

  P(6, 'p6 · Daily log: date at the next blank line, RECONNECT, one physical FIRST:, NEXT: to stop (Art 9.1)', `
## MON 28 SEP
– Vol 03 started: key, index p1,
  Later p2–3, week p4–5. 15 min.
RECONNECT: cal — sync Tue. nothing
  urgent today.
FIRST: open ANL query; run baseline
10:05 – runs; 3 min, slow but ok
10:40 × baseline matches last Q
× Ask about data access
13:20 = sleepy after lunch; walk 5'
15:10 – access request raised
  → WAIT on @7 (+ week @4)
17:30 NEXT: split by tenure

## TUE 29 SEP
FIRST: split by tenure (ANL)
09:40 – split works. nulls?
○ 11:00 team sync
11:45 – report due Fri 16 Oct
  → CAL alert set
14:00 – ANL is multi-session now
  → own page @7
cont. @8 →`);

  P(7, 'p7 · Work project: the tracker owns the backlog; the page holds my current slice + refs only (Art 2.1, 16)', `
# ANL · Retention [work]	29 SEP
Tracker owns backlog. Page = my slice.
Outcome: segment retention readout
  for Q4 planning.
× Baseline reproduced
× Split by tenure
× Nulls in tenure (4%) → "unknown"
× Segment B oddity
    × join filter dropped late rows
* × Draft + send report  CAL Fri 16
    × outline  × charts  × send
~~• Cohort by city~~ – out of scope
× Reason-code cut
    × codes mapping   × join
• Follow-up dashboard tile
    × spec  × mock v1  × v2 shipped
    > Q4 follow-ups → @4.8
WAIT: ~~events access~~ × Wed 30
{a}– 6 Oct DECISION: add reason
  codes. agreed in sync; tracker
  updated.
Refs: tracker ANL-2xx · approved NB
NEXT: see @4.8
Continued @4.8`);

  P(8, 'p8 · Log continues after a project page ("cont."); pending update • Mark … @7 (Art 3.3, 5.2)', `
## TUE 29 SEP cont.
14:05 – ADHOC: team dashboard down
14:40 × fixed dashboard filter
  (invisible work — it counts)
14:45 RESUME ANL @7: nulls
15:30 – nulls = 4% → rule on @7
– landlord: tap leaking → row @5
17:40 NEXT: segment B @7

## WED 30 SEP
FIRST: segment B — check the join
09:20 – late rows dropped by filter
{a}10:10 ! bug was "obvious" only
  after I wrote the question down.
  writing = thinking.
11:00 – access granted (WAIT done)
× Mark access done @7   (16:50)
12:30 ₹180 coffee + cake; skipped
  lunch, low energy
15:00 = scattered. 3 tabs open →
  closed 2, back to one thing
18:00 NEXT: report outline @7`);

  P(9, 'p9 · Park & Pivot: PAUSE line before the interruption, RESUME after (Art 9.3)', `
## THU 1 OCT
RECONNECT: dinner 19:00 (cal)
FIRST: report outline @7
09:30 – outline done → × @7
10:15 – PAUSE ANL @7: charts next;
  start with retention curve
  → ADHOC: help teammate w/ query
11:00 × helped (30 min)
11:05 RESUME @7 — curve
13:00 > Book dentist → W41 @15
    (tooth twinge)
16:30 – replied to landlord → × @5
○ 19:00 dinner w/ cousins
21:30 ! FIRST: works when it's a
  physical step, not a topic

## FRI 2 OCT — holiday
– Gandhi Jayanti. Light mode.
FIRST: sketch the GPU idea on S1
10:30 – sketch @S1
× Review S1 for actions   (11:40)
11:00 – it's multi-session → @10
cont. @11 →`);

  P(10, 'p10 · Project collection: outcome, indented tree, decisions, refs, NEXT:. Later checkpointed to p42 (Art 6.2, 7.3)', `
# CUDA Playground [GPU]	2 OCT
Outcome: run CUDA from a mobile
  browser.
{a}× Set up Modal account + GPU fn
× Hello-world kernel runs remotely
× Execution backend @17 ↔
    (child page owns the detail;
     outcome met 24 Oct)
• Mobile editor
    × pick editor: CodeMirror
    > rest → @42
> Deployment → @42
> End-to-end test → @42
– 9 Oct DECISION: serverless, not
  own VM — cost + no idle bill @S3
{b}! the hard part isn't CUDA, it's
  the plumbing around it
Refs: @S1 sketch · @S3 pricing
  @2.41 old GPU price notes
  @SB:CUDA Lab Architecture
NEXT: ~~backend~~ ~~editor~~ → @42

Continued @42 →`);

  P(11, 'p11 · Unplanned buys and feelings: ₹ and = are optional observations, not scores (Art 9.4, 12.3)', `
## FRI 2 OCT cont.
11:40 – S1 reviewed → 3 bullets
  put on @10
12:30 ₹1,450 headphones — "deal";
  bought in 4 min, didn't need
15:00 – nap. fine. holiday.
19:00 NEXT: Modal account @10

## SAT 3 OCT
FIRST: make Modal account @10
10:20 – account + GPU fn → × @10
11:00 – hello-world kernel runs
  remotely!! → × @10
  = excited — careful, don't
    redesign the whole thing
12:00 – groceries → × @5
13:00 ₹620 delivery lunch; tired
16:00 – laundry → × @5
– review tomorrow (alarm set)
NEXT: Sunday — weekly review`);

  P(12, 'p12 · Weekly review: 1 Rescue · 2 Reconcile · 3 Reorient · 4 Learn · 5 Improve (Art 13.1)', `
## SUN 4 OCT
FIRST: make chai; open book at p4
– WEEKLY REVIEW #1 (15 min)
1 RESCUE: scan @6–11 for open •
  – Book dentist → moved > W41
  – Mark access done @7 — closed
  – Bike service → was < LATER
  – all other • closed. clean.
2 RECONCILE: ANL @7 NEXT ok.
  GPU @10 NEXT: backend
  — will need its own page
3 REORIENT: W41 → p14–15
  lead work: report charts @7
  lead personal: GPU backend
{a}– ₹ recorded this week:
  180 + 1,450 + 620 = 2,250
  (recorded only — not a ledger)
{b}! restarting costs more than the
  task itself. same as @2.67a
  → collect in a topic page later
cont. @13 →`);

  P(13, 'p13 · Review boundary ("Reviewed through @13") so the next scan knows where to start (Art 13.1)', `
## REVIEW cont.
4 LEARN: 1 insight → @12b
  – headphones: bought fast after a
    review video. pattern? watch,
    don't fix yet.
5 IMPROVE: next week I'll make
  starting easier by writing
  FIRST: the night before.
– FRICTION: weekly grid cramped
  (test @S2)

Reviewed through @13, 4 Oct

## notes for W41
– report due Fri 16 — 2 weeks.
– cousins visiting Sat 10 → in CAL
– one demanding task at a time.









`);

  P(14, 'pp14–15 · Week 41 spread', `
# WEEK 41 · 5–11 OCT
Lead work: report charts @7
Lead personal: GPU backend → page

Fixed:
○ Tue 11:00 sync
○ Sat 10 cousins visiting

Waiting:
WAIT: design review of charts
  — check Thu

Themes: deep work before 12,
  meetings + admin after.








– Thu was rough → survival day
  (@19). that's allowed.`);

  P(15, 'pp14–15 · Rows resolve by outcome: done, moved, deferred or struck (Art 8.2)', `
[MTWTFSS] STANDALONE
[•-·····] > Book dentist → W42 @23
[×······] × Renew bus pass
[··×····] × Pay credit card
[····×··] × Groceries
[·····×·] × Clean before cousins
[······×] × Laundry
[··•·-··] ~~Fix bookshelf~~
              – landlord doing it

[MTWTFSS] PROJECT SESSIONS
[×××××··] ANL @7
[·××•···] GPU @10 / backend @17

– GPU Thu: planned, not done
  (survival day). blank ≠ failure.`);

  P(16, 'p16 · FIRST: written the night before; a PAUSE breadcrumb makes the restart take 2 min (Art 9.1, 9.3)', `
## MON 5 OCT
RECONNECT: wk @14 — report charts
FIRST: (written last night)
  open chart notebook; plot seg B
09:50 × seg B chart
11:30 – PAUSE ANL @7: next is the
  tenure chart → ADHOC: support
  question
12:10 RESUME — breadcrumb worked;
  back in 2 min, not 20
  ! → restart-cost topic, later
13:00 = flat after lunch; walk 10'
15:00 × tenure chart
17:30 NEXT: reason codes mapping

## TUE 6 OCT
FIRST: reason codes mapping
○ 11:00 sync
11:40 – scope + reason codes →
  DECISION on @7a
19:30 FIRST (personal): GPU backend
  — too big for one line on @10
  → child page @17
cont. @18 →`);

  P(17, 'p17 · Branch: a child collection with a Parent link; the child owns its detailed actions (Art 7.1)', `
# Execution backend	6 OCT
Parent: @10 (GPU)
Outcome: send code, get compile +
  run output back, safely.
× API endpoint (POST /run)
× Compile with nvcc in container
{a}× Capture compiler stderr
    – stderr merged with stdout!
× Limit output size (64 KB)
~~• Timeout via signal~~ – wrong:
    child procs survive
× Timeout via process-group kill
    – see @S6
× Resource limits (mem, 1 GPU)
× Basic tests: ok / compile error /
  timeout / huge output
– 20 Oct DECISION: no queue yet;
  one request at a time is fine

OUTCOME MET 24 Oct → × on @10



`);

  P(18, 'p18 · Pending update ("• Mark done @17") when the owner page can\'t be updated right away (Art 5.2)', `
## TUE 6 OCT cont.
20:15 – API endpoint works → × @17
20:40 – stderr merged into stdout?
21:00 PAUSE GPU @17: split stderr;
  try subprocess pipes
  (too tired — stop here)

## WED 7 OCT
FIRST: reason-code mapping (wk)
10:00 – mapping done → × @7
11:20 – teammate: "can you also…"
  → after Fri 16. asked in sync.
14:30 = irritated in meeting.
  wrote it here. moved on.
15:00 – credit card paid → × @15
16:00 – 3 tabs → closed 2
18:00 NEXT: chart review prep
21:00 GPU: nvcc in container works
× Mark compile done @17   (Fri)`);

  P(19, 'p19 · Survival mode: one necessary action, nothing else. Light mode the next day (Art 14.1–14.2)', `
## THU 8 OCT
– bad sleep, headache. SURVIVAL.
× One necessary action:
  reply to chart review comments
FIRST: open the comments thread
11:30 – replied. that's the day.
– WAIT design review → closed via
  the comments (@14)
RESUME (if useful): mark compile
  done @17 — worked Wed

## FRI 9 OCT
– better. Light mode.
FIRST: mark compile done @17 ×
10:30 – DECISION GPU: serverless,
  not VM (math @S3) → logged @10
11:00 – ANL draft: charts 70%
18:00 – groceries done → × @15
NEXT: Sat cousins. GPU Sun eve?`);

  P(20, 'p20 · Short review (≈5 min): rescue commitments, pick leads, skip the optional parts (Art 13.2)', `
## SAT 10 OCT
○ cousins visiting all day
₹2,100 dinner out — planned, fine
  (noting, not judging)
– nothing else. good day.

## SUN 11 OCT · SHORT REVIEW
low energy → the 5-minute version
RESCUE: open • since @13
  – Book dentist → > W42 @23
    (2nd move — watch it)
  – Mark compile done: closed Fri
  PAUSE GPU @17 stderr — still
    live; it's the NEXT
REORIENT: W42 → p22–23
  lead work: finish + send report
  lead personal: stderr @17
skipped: learn + improve. fine.
– desk mess keeps blocking GPU
  evenings → project @21

Reviewed through @20, 11 Oct`);

  P(21, 'p21 · A small personal project; closed when the outcome is met, not when boxes run out (Art 6.3, 6.5)', `
# HOME · Desk setup	11 OCT
Outcome: a desk I can sit at and
  start in under a minute.
× Clear desk surface fully
× Sort cables drawer (from LATER)
× Monitor arm
    × measure desk depth (60 cm)
    × order arm (planned buy)
    × install
× Lamp for evenings
    × move old lamp from shelf
× Chair height
< Standing desk LATER @50
    not now; revisit in spring
× Notebook spot: left of laptop
    × tray for book + pen
WAIT: ~~arm delivery~~ × Sat 24
– sketch @S4

OUTCOME MET 19 Nov — closed.
  index: [done]
`);

  P(22, 'pp22–23 · Week 42 + a two-week lifestyle experiment: cue, small action, review point (Art 12.1)', `
# WEEK 42 · 12–18 OCT
Lead work: send report (Fri 17:00)
Lead personal: GPU stderr @17

Fixed:
○ Wed 14:00 planning
○ Fri 17:00 report due (CAL alert)

Waiting:
WAIT: reason-code owner — chk Wed

Themes: report first, always.

EXPERIMENT · 2 weeks (12–25 Oct)
After dinner → load the dishes
  before leaving the kitchen.
Min: one item.
[MTWTFSS]
[×·××·×·]

  → week 2 on @30
– a blank is not a failure.`);

  P(23, 'pp22–23 · An action migrated twice gets examined, not just moved again (Art 5.3)', `
[MTWTFSS] STANDALONE
[•·-····] > Book dentist → W43 @31
              (moved 2× → examined @27)
[×······] × Order monitor arm
[··×····] × Pay rent
[·····×·] × Groceries
[·····×·] × Laundry
[···•···] ~~Call bank re: card~~
              – solved in the app
[·×·····] × Birthday gift (cousin)

[MTWTFSS] PROJECT SESSIONS
[××·××··] ANL @7 (report)
[×······] GPU @17 (stderr)
[······×] HOME @21

– Fri: report sent 16:40.`);

  P(24, 'p24 · Interstitial journaling: timestamps only where sequence matters (Art 9.2)', `
## MON 12 OCT
FIRST: (from last night) open the
  report doc; write summary para
09:45 × summary para
10:30 – PAUSE ANL: methods section
  → ADHOC: prod alert (not mine,
  but I was asked)
11:50 RESUME ANL: methods
13:00 ₹350 lunch delivery
15:00 × methods section
19:30 GPU: try pipes for stderr
20:30 – stderr captured! (@17a)
× Mark @17a done   (20:35)
21:00 – dishes (exp. day 1)
NEXT: charts final pass

## TUE 13 OCT
FIRST: charts final pass
10:00 × charts final
11:00 – reason-code owner replied
  → WAIT closed on @22
○ 11:00 sync — nothing new
NEXT: limitations section`);

  P(25, 'p25 · Learning: notebook holds the question + result; the depth lives in SilverBullet (Art 11.1)', `
## WED 14 OCT
○ 14:00 planning
14:50 – Q4 asks: mine are in the
  tracker, not here
19:10 • Learn why covariance
  eigenvectors = principal dirs
19:15 FIRST: derive PCA on a 2-D
  example by hand (@S5)
20:05 × study session done
{a}! covariance stretches space most
  along its eigenvectors; they
  don't rotate, only scale
  @SB:PCA Intuition
× Explain it from memory next
  study session   (Sat 17)
21:00 – dishes (exp.)

## THU 15 OCT
FIRST: report: limitations section
11:00 × limitations
16:00 – PAUSE ANL: proofread
  → ADHOC: data request (20 min)
16:30 RESUME: proofread 1/2
NEXT: proofread 2/2, send Fri`);

  P(26, 'p26 · A deadline: the project owns the action, the calendar owns the alert (Worked example E)', `
## FRI 16 OCT
RECONNECT: report due 17:00 (CAL)
  — the task lives on @7 (*)
FIRST: proofread 2/2
11:30 × proofread
14:00 = nervous re: sending. sent
  it to myself first, then for real
16:40 – REPORT SENT → × on @7
  – removed the 17:00 alert
17:00 – cohort-by-city ask → out of
  scope; logged on @7
18:00 – relief. ice cream ₹150

## SAT 17 OCT
FIRST: explain PCA from memory
10:30 – got 70%. forgot why the
  eigenvalues = variance. reopened
  @SB:PCA Intuition — gap filled
14:00 ₹1,900 phone stand — right
  after a review video. again.
– groceries + laundry → × @23
NEXT: weekly review (full)`);

  P(27, 'p27 · Full weekly review; the twice-migrated dentist gets a clearer first step (Art 13.1, 5.3)', `
## SUN 18 OCT · WEEKLY REVIEW
1 RESCUE @21–26:
  – all • closed or moved, except
    Book dentist — moved 2×.
    why? don't know which clinic;
    I hate calling. smaller step:
    × ask Amma for the clinic no.
        (2 min, message)   18:20
    → call clinic: W43 row @31,
        Mon 10:00 alert in CAL
2 RECONCILE:
  ANL @7 — report done; next =
    reason-code cut
  GPU @17 — stderr ×, timeout next
  HOME @21 — arm ordered, WAIT
3 REORIENT: W43 → p30–31
  lead work: reason-code cut
  lead personal: GPU timeout
{a}= evenings: tired → delivery +
  impulse buys (see ₹ lines)
cont. @28 →`);

  P(28, 'p28 · Harvest ≤ 3 insights (act / preserve / connect / test / leave) + recorded-₹ total (Art 11.2, 12.3)', `
## REVIEW cont.
4 LEARN — harvest ≤ 3:
  @12b restart cost → PRESERVE:
    topic page @29
  @25a PCA → CONNECT: done in SB
  @8a writing = thinking → LEAVE
  ₹ recorded this week:
    350 + 150 + 1,900 = 2,400
    (incomplete by design)
  – pattern: 2 buys right after
    review videos (@11, @26)
5 IMPROVE: next week I'll make
  impulse buys harder by waiting
  24 h on anything over ₹1,000.
  – but 1 experiment at a time:
    start after dishes ends.
– dishes experiment: 4/7. fine.

Reviewed through @28, 18 Oct







`);

  P(29, 'p29 · Topic collection: a short synthesis + links, not copies (Art 10.4)', `
# TOPIC · Restart costs	18 OCT
synthesis + links, not copies
– restarting a task costs more than
  the task. breadcrumbs cut it.
@2.67a — first noticed (vol 2)
@12b — same, in weekly review
@16 (Mon 5) — PAUSE line: back in
  2 min instead of 20
@9 (Thu 1) — FIRST: works when it's
  physical, not a topic
! agent design has the same problem:
  save the state needed to resume
  @SB:Agent Memory Design
– test: does NEXT: at shutdown cut
  Monday-morning drift? watch W43
< write a short note "restarting
  work" → LATER @2

+ 27 Oct: Day-30 check agrees @39
+ 2 Nov: RESET took 4 min @40
+ 10 Nov: mentor: "ship the boring
  version first" — same family @55
`);

  P(30, 'pp30–31 · Week 43 · experiment week 2 and its review point', `
# WEEK 43 · 19–25 OCT
Lead work: reason-code cut @7
Lead personal: GPU timeout @17

Fixed:
○ Mon 10:00 call dentist (CAL)
○ Thu 11:30 dentist (CAL)
○ Tue 11:00 sync

Waiting:
WAIT: monitor arm — check Fri

Themes: shutdown = a NEXT: line,
  nothing more.

EXPERIMENT wk 2 (dishes)
[MTWTFSS]
[××·×××·]
– 5/7. decide at the review @35



`);

  P(31, 'pp30–31 · A row pulled in from Later; a task deferred back to Later', `
[MTWTFSS] STANDALONE
[×······] × Call dentist (CAL)
[···×···] × Dentist appointment
[··×····] × Bike service (from LATER)
[·····×·] × Groceries
[·····×·] × Laundry
[·•×····] × Renew domain
[····•··] < Photo backup LATER @50

[MTWTFSS] PROJECT SESSIONS
[×·×××··] ANL @7
[××××××·] GPU @17
[·····×·] HOME @21 (arm install)

– dentist: 3 weeks of migrating,
  4 minutes of calling. noted.`);

  P(32, 'p32 · Strike-through = cancelled (wrong approach), replacement written next to it (Art 6.3)', `
## MON 19 OCT
FIRST: call dentist 10:00 (CAL)
10:05 – booked Thu 11:30 → CAL;
  call row × @31
10:20 – that took 4 minutes.
FIRST (work): reason-code cut
11:30 – PAUSE ANL @7: join codes
  → ADHOC: reviewer Q on report
12:00 RESUME: join codes
16:00 – codes joined → × @7
19:30 GPU: timeout via signal
21:10 – signal: children survive
  → struck on @17; new • there:
  timeout via process group
NEXT: pgroup kill (notes @S6)

## TUE 20 OCT
FIRST: pgroup kill test
08:30 – works locally (@S6)
○ 11:00 sync
11:40 – DECISION GPU: no queue yet
  → @17
14:00 = foggy. switched to Light.
  protected: sync notes sent ×
17:00 NEXT: timeout on Modal`);

  P(33, 'p33 · FRICTION lines collect evidence for later changes, instead of redesigning now (Art 17.3)', `
## WED 21 OCT
FIRST: deploy timeout to Modal
09:00 – deployed; passes → × @17
10:00 – work: reason-code cut 60%
13:00 ₹420 lunch out w/ team
15:30 – domain renewed → × @31
21:00 – dishes (exp.)
– FRICTION: busy days spill over
  2 pages. fine? → just watch.
NEXT: resource limits @17

## THU 22 OCT
○ 11:30 dentist — filling done;
  follow-up Thu 5 Nov → CAL
14:00 FIRST: resource limits @17
15:30 – mem limit; GPU = 1 → × @17
– reason-code cut 90%

## FRI 23 OCT
FIRST: basic tests @17
11:00 – 4 tests pass → × @17
12:00 – reason-code cut → tracker
  + × @7
17:30 NEXT: backend outcome? check`);

  P(34, 'p34 · Closing a branch: child outcome met → parent marked done on both pages (Art 7.1)', `
## SAT 24 OCT
FIRST: check backend outcome @17
10:30 – outcome met → × on @17,
  × backend on @10. both updated.
11:00 – monitor arm in → × @21
₹2,400 monitor arm (planned)
14:00 – GPU next: mobile editor.
  stays on @10 until it's big.
16:00 – groceries + laundry → × @31
= good week. tired, but good.
NEXT: review tomorrow

– scratch check: S5, S6 → nothing
  open. (scratch is not an inbox)










`);

  P(35, 'p35 · Review decides the experiment: keep the cue, retire the tracking (Art 12.1)', `
## SUN 25 OCT · WEEKLY REVIEW
1 RESCUE @32–34: clean.
  – photo backup: < LATER (row @31)
2 RECONCILE:
  GPU: backend done. next branch:
    mobile editor (on @10 for now)
  ANL: dashboard tile (tracker)
  HOME: lamp + tray left
3 REORIENT: W44 → p36–37
  lead work: dashboard tile
  lead personal: pick an editor
4 LEARN: dishes exp. — 9/14 days.
  kitchen clearer. keep the cue,
  drop the tracking row → @51
  ₹ recorded: 420 + 2,400 = 2,820
5 IMPROVE: next week I'll make
  capture easier by keeping the
  pen IN the book.
– travelling Wed 28 → Sun 1
  (family). book may not come.

Reviewed through @35, 25 Oct`);

  P(36, 'pp36–37 · A short week: travel planned in, phone note as a temporary capture buffer (Art 2.1)', `
# WEEK 44 · 26 OCT – 1 NOV
Lead work: dashboard tile
Lead personal: pick an editor

Fixed:
○ Tue 11:00 sync
○ Wed 07:10 train (CAL)
○ Wed – Sun family visit

Waiting:
WAIT: tile spec from PM — chk Tue

Themes: short week, 2 work days.
– travel: phone note = capture
  buffer only. transfer after.








`);

  P(37, 'pp36–37 · Blank past cells mean "nothing recorded" — never fill them in (Art 8.2)', `
[MTWTFSS] STANDALONE
[×······] × Pack + charge things
[·×·····] × Sweets for family
[•······] × Return parcel  CAL Tue 3
              (done after the trip)

[MTWTFSS] PROJECT SESSIONS
[××·····] ANL tile
[×······] GPU editor @10

– Wed–Sun blank. that's true,
  not a failure.












`);

  P(38, 'p38 · Invisible work logged as ×; the day-30 mark of adoption (Art 9.4, 17.1)', `
## MON 26 OCT
FIRST: tile spec questions → PM
10:00 × sent; WAIT till Tue
10:30 – PAUSE: tile mock v1, start
  from v1 chart → ADHOC: urgent
  fix for leadership deck
12:30 × deck fix (2 h — invisible
  work, still counts)
12:35 RESUME tile — breadcrumb, 2
  min. works again.
19:30 GPU: editor options
20:30 – picked CodeMirror
  → × on @10
21:00 – packing list on S8
× Review S8 for actions   (Tue)
NEXT: tile mock v1

## TUE 27 OCT · DAY 30
FIRST: tile mock v1
○ 11:00 sync — spec arrived
  (WAIT closed)
– day 30 of vol 03 → check @39
cont. @40 →`);

  P(39, 'p39 · Day-30 check: qualitative acceptance tests + one small amendment (Art 17.2–17.3)', `
# DAY 30 CHECK	27 OCT
– opened the book most days?
    yes — 26 of 30
– does opening it make starting
  easier?  yes. FIRST: is the trick
– resume without rereading days?
    yes — PAUSE + NEXT: lines
– anything important missed?
    no. dentist was slow (@27)
– add a subtask without a mess?
    yes — branch @17 worked
– find an old insight?
    yes — @2.67a via topic @29
FRICTION seen more than once:
  – weekly grid cramped (@5, @13)
  – busy days spill (@33) — ok
AMENDMENT (smallest change):
  try 2 wks: bigger grid on the
  right page. keep or drop at the
  monthly review.
NOT changing: anything else.
`);

  P(40, 'p40 · Missed days: no backfill. Zero-debt RESET, stage 1 — just start (Art 14.3)', `
## TUE 27 OCT cont.
15:00 – tile mock v1 → tracker
16:30 – leaving tomorrow early.
  NEXT (wk): tile v2 from feedback
  NEXT (GPU): editor ↔ backend
  protected: return parcel — row
  @37 + CAL Tue alert
21:30 – S8 reviewed: all packed




## MON 2 NOV — RESET
Right now: × unpack; charge laptop
FIRST: open tracker + cal for
  anything urgent (10 min box)
09:40 – nothing on fire. 1 review
  comment → × reply today (14:00)
09:45 – RESET took 4 minutes.
  no debt. no repair.
cont. @41 →`);

  P(41, 'p41 · RESET stage 2: rescue from the last review boundary; phone captures transferred (Art 14.3)', `
## MON 2 NOV cont. · RESCUE
stage 2, after lunch, 15-min box
– last boundary: "Reviewed
  through @35" → scan @36–40
– phone notes from the trip (3):
  > Reply uncle re: docs → W45
  < Train tickets for Dec LATER
  ~~• GPU leaderboard!!~~
    – no. not now.
– parcel: still on @37, CAL Tue
– W44 spread: not reviving it.
– GPU @10 page is crowded →
  checkpoint tomorrow
NEXT: tile v2

## TUE 3 NOV
FIRST: tile v2
11:00 – tile v2 → tracker
12:00 – checkpoint GPU → @42




`);

  P(42, 'p42 · State checkpoint: carry only open work, constraints, refs and NEXT:; link back to @10 (Art 7.3)', `
# CUDA Playground [GPU]	3 NOV
Previous @10 · origin @10
Outcome: run CUDA from a mobile
  browser.
– backend done (@17) — not copied
• Mobile editor @61 ↔
    × CodeMirror (from @10)
    × wire editor → /run
    × show stderr nicely
× Deployment
    × CORS header (@S10)
    × rate limit per IP
    ~~• custom domain~~ – no need
× End-to-end test from phone
    – 10 Nov, works!
Constraints: free tier; one request
  at a time (@17)
Refs: @SB:CUDA Lab Architecture
NEXT: editor UX — see @61

Continued @4.6 →
`);

  P(43, 'p43 · The checkpoint is recorded in the log and the directory is updated', `
## TUE 3 NOV cont.
13:00 – checkpoint done @42:
  old • on @10 marked >,
  directory updated 10 → 42
14:00 – parcel returned → × @37
  ₹95 postage
15:30 – work: next = tile review Thu
17:00 = still tired from the trip;
  Light mode till Thu.
19:30 – week spread midweek →
  W45 on @44–45, Wed onwards.
NEXT: wire editor → /run @42














`);

  P(44, 'pp44–45 · Midweek start is valid: only the days that are left (Art 8.1)', `
# WEEK 45 · 2–8 NOV (from Wed)
Lead work: tile review → ship
Lead personal: editor → /run @42

Fixed:
○ Thu 11:30 dentist follow-up
○ Thu 15:00 tile review
○ Sun 8 Diwali — home, no work

Waiting:
WAIT: tile access perms — chk Thu

Themes: Light mode till Thu.

AMENDMENT test (from @39):
  bigger grid on the right page →









`);

  P(45, 'pp44–45 · Testing the amendment: a roomier grid, judged at the monthly review', `

[MTWTFSS] STANDALONE

[··•×···] × Reply uncle re: docs

[···×···] × Dentist follow-up

[··•··×·] × Diwali shopping

[···•·×·] × Clean home (Diwali)

[····×··] × Diwali clothes


[MTWTFSS] PROJECT SESSIONS

[··×·××·] GPU @42

[···××··] ANL tile


– bigger rows: easier to write.
  keep? → @49`);

  P(46, 'p46 · Pending updates closed the same evening', `
## WED 4 NOV
FIRST: editor POST → /run @42
11:00 – work light: emails, tile
  notes
20:00 – editor talks to backend!!
  output shows in the page
× Mark @42 done   (20:05)
NEXT: show stderr nicely

## THU 5 NOV
○ 11:30 dentist follow-up
○ 15:00 tile review
16:00 – tile: 2 changes, then ship
  (tracker updated)
16:30 – replied to uncle → × @45
NEXT: tile changes 1 + 2







`);

  P(47, 'p47 · A buy noted without judgement; PAUSE line mid-bug (Art 12.3, 9.3)', `
## FRI 6 NOV
FIRST: tile change 1
11:00 – tile changes 1 + 2 done
14:00 – tile shipped. W45 lead met.
15:00 ₹1,250 Diwali clothes
  (planned)
16:00 ₹2,300 earbuds "sale" — the
  24 h idea isn't running yet.
  noted, not judged.
19:00 GPU: stderr display @42
21:00 – PAUSE GPU @42: colours ok,
  line numbers off by one?

## SAT 7 NOV
FIRST: fix line offset @42
10:00 – off-by-one fixed → × @42
11:00 – Diwali shopping → × @45
12:00 – home cleaned → × @45
– reviews today (Sun = Diwali):
  weekly @48, monthly @49





`);

  P(48, 'p48 · Weekly review moved a day — Sunday is a suggestion, not a rule (Art 13.1)', `
## SAT 7 NOV · WEEKLY REVIEW
(Sun is Diwali → a day early)
1 RESCUE @41–47: all closed.
  – Later full → threaded to @50;
    train tickets written there
2 RECONCILE:
  GPU @42 → NEXT: e2e test plan
  ANL: tile shipped. next is in
    the tracker; nothing to carry
  HOME @21: lamp + tray left
3 REORIENT: W46 → p52–53
4 LEARN: ₹ recorded this week:
  95 + 1,250 + 2,300 = 3,645
  – earbuds = review-video buy #3
    → 24 h experiment @51
5 IMPROVE: see monthly @49

Reviewed through @48, 7 Nov







`);

  P(49, 'p49 · Monthly review: broader questions, real bank statements for money, max two changes (Art 13.3)', `
# MONTHLY REVIEW · OCT	7 NOV
Projects advancing?
  GPU yes — backend done, editor on
  ANL yes — report + tile shipped
  HOME slow, but moving
Commitments still worth making?
  SCH — no. stays parked (@2.23)
Recurring friction?
  – bigger grid (@45) works: KEEP
  – evenings: tired → ₹ + delivery
{a}Spending vs priorities?
  checked the bank statement (not
  the ₹ lines): food delivery ≈ 3×
  what I guessed.
System helping start + restart?
  yes. RESET (@40) was painless.
Changes for November (max 2):
  1. 24 h pause on buys > ₹1,000
     → experiment @51
  2. Sunday batch-cook for Mon–Tue
`);

  P(50, 'p50 · Later, threaded: "← @3" links back. At volume end, real items move on (> @4.2); ideas stay (Art 7.2, 15.3)', `
# LATER (cont.) ← @3	7 NOV
> Train tickets for Dec visit
    → W46 @53   (from phone @41)
> Photo backup → @4.2
    (deferred again from W43 @31)
> Standing desk — revisit Apr
    → @4.2   (from HOME @21)
~~– GPU leaderboard?~~
    no: "ship the boring version
    first" (@55)
– Read: "The Mom Test"
– 10-min morning stretch
– Weekend trek, Jan

– carry only what's still wanted
  into vol 04 (@66). ideas stay
  here, findable via the index.









`);

  P(51, 'p51 · Experiments: one at a time; continue, change, retire or abandon at the review point (Art 12.1–12.3)', `
# EXPERIMENTS	7 NOV
1 · Dishes after dinner (12–25 Oct)
  cue: dinner done → load dishes
    before leaving the kitchen
  min: one item
  result: 9/14 days, kitchen
    clearer → RETIRE the tracking.
    the cue stays. (@22, @30)

2 · 24 h pause, buys > ₹1,000
  (9–22 Nov) — not food, not real
  needs, not genuine deadlines
  min: write it here, wait 24 h
  log:
  10 Nov keyboard ₹3,200 → no
  14 Nov jacket ₹1,800 → yes —
    still wanted it. fine.
  21 Nov 2nd lamp ₹1,400 → no
  result → @65







`);

  P(52, 'pp52–53 · Week 46 · the experiment lives on its own page, the week just points to it', `
# WEEK 46 · 9–15 NOV
Lead work: Q4 follow-ups (tracker)
Lead personal: GPU e2e test @42

Fixed:
○ Tue 18:00 mentor call
○ Thu 11:00 sync
○ Fri 17:00 tax docs due (CAL)

Waiting:
WAIT: free-tier quota increase
  — check Wed

Themes: Sunday batch-cook (change 2)

EXPERIMENT 2 · 24 h rule → @51








`);

  P(53, 'pp52–53 · Week 46 grid (bigger rows kept after the monthly review)', `

[MTWTFSS] STANDALONE

[×······] × Train tickets (LATER)

[··•-×··] * × Tax docs to CA

[····•··] > Library book → W47

[·×·····] × Mentor call prep

[·····×·] × Groceries

[·····×·] × Laundry

[······×] × Sunday batch-cook


[MTWTFSS] PROJECT SESSIONS

[××·×·×·] GPU @42

[·····×·] HOME @21 (lamp)`);

  P(54, 'p54 · A holiday with no FIRST: is allowed. Work steps stay in the tracker (Art 2.1)', `
## SUN 8 NOV
○ Diwali at home.
– no FIRST: today. that's allowed.

## MON 9 NOV
FIRST: open tracker; pick Q4 item
09:30 – picked. my step: draft the
  metric definitions (tracker owns
  the rest)
10:00 – train tickets → × @53
  ₹3,400 (planned, family)
15:00 × metric defs draft
19:30 GPU: e2e test plan @42
  – phone → editor → /run → output
NEXT: run the test from my phone

## TUE 10 NOV
FIRST: run e2e test from phone
08:30 – FAIL: CORS on the endpoint
  (@S10)
cont. @55 →`);

  P(55, 'p55 · WAIT with a check date; an insight from a conversation, linked to the topic (Art 5.3, 10.1)', `
## TUE 10 NOV cont.
08:50 – PAUSE GPU @42: add CORS
  header in fn; retest
  → work day starts
14:00 – keyboard ₹3,200? → 24 h
  rule @51
○ 18:00 mentor call
18:50 ! "ship the boring version
  first" → GPU: no leaderboard
  @29
21:00 – CORS fixed; e2e PASSES
  from the phone!! → × @42

## WED 11 NOV
FIRST: metric defs review (wk)
10:00 × review
11:00 – keyboard: next day, don't
  want it. (exp 2: no)
13:00 – quota: no reply → follow
  up Fri; CAL alert (WAIT @52)
NEXT: rate limit per IP @42`);

  P(56, 'p56 · Light mode on a tired Friday: protect the time-bound things first (Art 14.1)', `
## THU 12 NOV
○ 11:00 sync
11:30 – DECISION (wk): metric defs
  approved; tracker updated
19:30 GPU: rate limit per IP
21:00 – PAUSE GPU @42: limiter
  works; test with 2 phones
= proud. small win.

## FRI 13 NOV
RECONNECT: tax docs 17:00 (CAL)
FIRST: tax docs to CA (row @53)
10:15 – sent → × @53
11:00 – followed up quota:
  approved. WAIT closed @52
14:00 = tired. Light mode.
  protected: tax + quota, done
– library book: not today
NEXT: test limiter with 2 phones





`);

  P(57, 'p57 · Short Sunday review; the editor gets its own child page (Art 13.2, 7.1)', `
## SAT 14 NOV
FIRST: test limiter with 2 phones
11:00 – limiter ok → × @42
12:00 ₹1,800 jacket — waited 24 h,
  still wanted it (@51)
15:00 – HOME: lamp moved → × @21

## SUN 15 NOV · WEEKLY REVIEW
1 RESCUE @54–57: library book
  row > W47 @59. rest clean.
2 RECONCILE: GPU @42 → editor UX
  needs its own page (Tue)
  HOME: only the tray left
3 REORIENT: W47 → p58–59
4 LEARN: ₹ this week: 3,400 +
  1,800 — both deliberate
5 IMPROVE: ~15 pages left before
  the scratch → plan vol 04 for
  next Sunday

Reviewed through @57, 15 Nov`);

  P(58, 'pp58–59 · Week 47: closing loops, preparing the next volume (Art 15.2)', `
# WEEK 47 · 16–22 NOV
Lead work: Q4 follow-up #2
Lead personal: editor UX @61

Fixed:
○ Tue 11:00 sync
○ Sun 22 review + vol 04 (CAL)

Waiting:
WAIT: — none —

Themes: close loops. HOME done.
  vol 04 transition on Sunday.

– book nearly full: front @58,
  scratch already at S10 (p71).









`);

  P(59, 'pp58–59 · Week 47 grid', `

[MTWTFSS] STANDALONE

[×······] × Return library book

[·×·····] × Pay rent

[·····×·] × Buy A6 notebook (vol 04)

[·····×·] × Groceries

[·····×·] × Laundry

[······×] × Sunday batch-cook

[···•-··] ~~Call ISP~~ – fixed itself


[MTWTFSS] PROJECT SESSIONS

[·×××···] GPU editor @61

[··×····] HOME @21 (tray)`);

  P(60, 'p60 · Low energy, no project work — and no guilt line needed', `
## MON 16 NOV
FIRST: Q4 follow-up #2: the query
10:00 – library book → × @59
11:30 – PAUSE wk: query step 3
  → ADHOC: help new joiner set up
12:20 RESUME step 3
16:00 – query → tracker
19:00 = low. no GPU tonight. fine.
NEXT: GPU — list editor UX issues

## TUE 17 NOV
FIRST: list editor UX issues
08:30 – 6 issues → its own child
  page @61
cont. @62 →









`);

  P(61, 'p61 · Second branch: child of the checkpoint page @42; carried to vol 04 (Art 7.1, 15.3)', `
# Mobile editor	17 NOV
Parent: @42 (GPU)
Outcome: comfortable to write and
  run a kernel on a phone.
× Big Run button, thumb reach
• Keyboard covers the output
    × try output on top — better
    • test on a small phone
• Stderr → highlight error line
    × parse nvcc line numbers
    • tap error → jump to line
• Save last code locally
• Example kernels menu
~~• Syntax themes~~ – later, if ever
– 18 Nov DECISION: no accounts;
  local only. simpler.
Refs: wireframe @S11
NEXT: tap error → jump to line

Continued @4.7 →

`);

  P(62, 'p62 · Decision logged where it matters, in one line', `
## TUE 17 NOV cont.
○ 11:00 sync
12:00 – rent paid → × @59
20:00 – Big Run button → × @61
21:00 – output on top: better → × @61

## WED 18 NOV
FIRST: parse nvcc line numbers @61
09:00 – parse done → × @61
10:00 – wk: tracker items, no notes
  needed here
– DECISION GPU: no accounts → @61
20:00 – HOME: tray in → × @21
  → outcome met? check Thu morning
NEXT: (wk) follow-up review








`);

  P(63, 'p63 · A project closed: outcome met, directory marked [done] (Art 6.5)', `
## THU 19 NOV
FIRST: check HOME outcome @21
08:10 – sat down, started in 30 s.
  outcome met → × HOME, closed.
  index: HOME [done]
11:00 – wk review ok
19:30 GPU: tap error → jump @61
21:00 – PAUSE GPU @61: jump works
  on desktop, not iOS. scroll?

## FRI 20 NOV
FIRST: (wk) Q4 summary note
12:00 – summary → tracker
16:00 = Friday fog. Light.
– front @63, scratch at S11 (p70)
  → ~5 pages. vol 04 this Sunday.
NEXT: iOS scroll bug @61







`);

  P(64, 'p64 · The front is about to meet the scratch section (Art 3.1, 15.2)', `
## SAT 21 NOV
FIRST: buy the A6 notebook (vol 04)
11:00 – bought → × @59: kraft, dot
  grid, 80 pages, thread-bound. ₹320
14:00 – iOS jump: needs
  scrollIntoView after focus
  (@S12) — not fixed yet.
  NEXT stays on @61
16:00 – groceries + laundry → × @59
– tomorrow: review + transition
  @66–67, then label vol 04.

– exp 2: 2nd lamp ₹1,400 → waited,
  didn't want it. (@51)














`);

  P(65, 'p65 · Last weekly review in this volume (Art 13.1)', `
## SUN 22 NOV · WEEKLY REVIEW
last review in vol 03
1 RESCUE @58–64 + scratch S9–S12:
  × all clear. S12: iOS scroll →
  already the NEXT on @61
2 RECONCILE directory @1:
  GPU @42 + editor @61 → carry
  ANL → my slice → @4.8
  HOME done. SCH parked.
3 REORIENT: W48 → vol 04
4 LEARN: exp 2 (24 h rule): 2 of 3
  buys dropped. KEEP the habit,
  drop the log. (@51)
  ₹ this week: 320 (bank statement
  at month end)
5 IMPROVE: nothing. it works.
  "simplify before adding."

Reviewed through @65, 22 Nov
→ TRANSITION @66`);

  P(66, 'p66 · Volume transition: rescue, checkpoint live projects, qualify old addresses (Art 15.3)', `
# VOL 03 → VOL 04	22 NOV
1 vol 04 labelled "04 · Nov 2026–"
  key, index @4.1, Later @4.2–3
2 RESCUE standalone + WAIT:
  > 6 Later items still wanted
    → @4.2. ideas stay here.
  WAIT: none open
3 CHECKPOINTS (state, not history)
  GPU        @42 → @4.6
  Mobile ed. @61 → @4.7
  ANL slice  @7  → @4.8
  – inherited addresses qualified:
    origin @3.10, backend @3.17
4 dormant branches: none
5 threaded both ways; directory
  @4.1 updated
6 vol 03 → shelf, after vol 02
cont. @67 →



`);

  P(67, 'p67 · Forwarding references written in the old volume; privacy check before shelving (Art 15.3, 16)', `
## TRANSITION cont.
forwarding marks written:
  @10, @42 "Continued @4.6"
  @61 "Continued @4.7"
  @7 "Continued @4.8"
  Later @2–3, @50: 6 × "> @4.2"
index @1: final state. topics stay
  here (vol 03 = 28 Sep – 22 Nov)
privacy check: no passwords, no
  client data; work = refs only.
SB catalogue of volumes? not yet —
  retrieval hasn't hurt. (15.4)
spine label written ×
– took 35 min. carried state,
  not history.









`);

  P(68, 'p68 · Last front page: the front has met the scratch section. Volume closed (Art 15)', `
# VOL 03 — CLOSED	22 NOV
28 Sep – 22 Nov 2026 · 1–68 + S1–S12
front meets the scratch here →

what worked:
  – FIRST: + NEXT: (start/restart)
  – one home per action
  – RESET instead of repair
what I dropped:
  – tracking rows after experiments
  – the urge to make pages neat

vol 04 starts with:
  W48 · 23–29 NOV @4.4–4.5
  THU 26 NOV
  FIRST: ______________________

"does it make it easier to decide,
 begin, remember, resume,
 understand and improve?"
  — yes. simplify before adding.



`);

  /* ---------- scratch pages: filled from the back (S1 = p80) ---------- */
  P(80, 'S1 · Scratch from the back: rough sketches. Not an inbox — scanned for actions after (Art 3.2)', `
2 Oct — GPU idea
@@gpuArch:10

– Modal? or own VM? (→ S3)
– editor: monaco too heavy for
  phone? try something lighter
– security!! untrusted code →
  container + limits
– stderr must come back

→ actions: 3 bullets onto @10
  (reviewed Fri 11:40)
`, 1);

  P(79, 'S2 · Testing the weekly grid against real handwriting before adopting it (Art 8.1)', `
4 Oct — grid test
@@gridTest:11

– 1.5 dots per row is easier with
  my handwriting.
– only change after 2 weeks of
  evidence → FRICTION line @13
`, 2);

  P(78, 'S3 · Disposable calculation; the decision it led to is logged on the project page', `
9 Oct — cost math
@@pricing:10

– rough. not a ledger.
– decision written on @10.
`, 3);

  P(77, 'S4 · A layout sketch for the HOME project (linked from @21)', `
11 Oct — desk
@@desk:10

– notebook needs a fixed spot
  where the next transition
  happens → tray, left of laptop
`, 4);

  P(76, 'S5 · Study scratch: deriving PCA by hand; the clean version went to SilverBullet (Art 11.1)', `
14 Oct — PCA by hand
@@pca:10

Σv = λv  → stretch, no turn
var(along u) = uᵀΣu, |u| = 1
max when u = v1 → λ1 = 3
– so eigenvalue = variance along it
  (forgot this on Sat. fixed.)
→ @SB:PCA Intuition
`, 5);

  P(75, 'S6 · Debugging scratch for the timeout (referenced from @17, @32)', `
19 Oct — why won't it die?
@@timeout:10

– struck "via signal" on @17
– new bullet: process group
`, 6);

  P(74, 'S7 · Venting in the scratch pages is fine — privacy permitting (Art 9.4)', `
20 Oct — fog
@@vent:5
= everything feels like 3 things
  at once. meeting ran 90 min.
  slack pings. didn't eat.
= ok. it's not a crisis, it's a
  tired brain.
– what's actually due? → nothing
  today. sync notes only.
– water. walk 10'. then ONE thing.

→ actions: "send sync notes" — it
  was already on @32. nothing new.
`, 7);

  P(73, 'S8 · A packing list; the front log carries "• Review S8 for actions" until it is checked', `
26 Oct — packing (Wed trip)
@@packing:4
× chargers ×2   × power bank
× meds          × sweets box
× ID + tickets (phone)
× 3 days clothes
× notebook?? — no. phone note.
× headphones (the ₹1,450 ones)
~~× laptop~~ — not working. leaving it.

– reviewed 27 Oct → @40
`, 8);

  P(72, 'S9 · A mind map of related ideas; the useful outcome becomes a LATER item', `
3 Nov — ideas around restarting
@@mindmap:10

– don't start a blog now.
– one line in LATER @50.
`, 9);

  P(71, 'S10 · Debugging the CORS failure from the end-to-end test (@54–55)', `
10 Nov — CORS
@@cors:10

– note to self: test from the
  phone EARLY next time.
`, 10);

  P(70, 'S11 · Wireframe for the mobile editor child page @61', `
17 Nov — editor UX
@@phone:14

– 6 issues → child page @61
`, 11);

  P(69, 'S12 · Last scratch page: next to the last front page. Time for a new volume (Art 15.2)', `
21 Nov — iOS jump bug
– tap error → focus line → page
  doesn't scroll on iOS
– try: scrollIntoView after focus,
  in requestAnimationFrame?
– NEXT stays on @61

22 Nov — vol 04 label
@@label:7

– front met the scratch on p68 ↔
  S12 (p69). volume full.
`, 12);

  var toc = [
    ['Cover · volume label', 'cover'],
    ['The key (inside cover)', 'ifc'],
    ['Index + active directory', '1'],
    ['Later (threaded to p50)', '2'],
    ['Weekly spread + grid', '4'],
    ['Daily log · FIRST: · NEXT:', '6'],
    ['Work project (tracker owns)', '7'],
    ['Pending update', '8'],
    ['Park & Pivot · RESUME', '9'],
    ['Project collection', '10'],
    ['Weekly review (full)', '12'],
    ['Branch · child collection', '17'],
    ['Survival day', '19'],
    ['Short review', '20'],
    ['Lifestyle experiment', '22'],
    ['Migrated twice → examined', '23'],
    ['Learning + insight', '25'],
    ['Deadline owned by CAL', '26'],
    ['Harvest + ₹ total', '28'],
    ['Topic collection', '29'],
    ['Day-30 check + amendment', '39'],
    ['Missed days · RESET', '40'],
    ['State checkpoint', '42'],
    ['Midweek week start', '44'],
    ['Monthly review', '49'],
    ['Experiments page', '51'],
    ['Closing a project', '63'],
    ['Volume transition', '66'],
    ['Scratch from the back (S1)', '80'],
    ['Last scratch · volume full', '69'],
    ['Inside back cover · privacy', 'ibc']
  ];

  window.NOTEBOOK = { pages: pages, covers: covers, sketches: SKETCH, toc: toc, front: 68 };
})();
