/* =====================================================================
   js/tiles.js — how a pattern area is cut into squares.
   Shared by the site (js/main.js) and the layout editor (admin/layout.html),
   so the editor draws the arrangement the site will draw.

   An area is a grid of squares (rows × cols). Squares are grouped into
   blocks; each block is drawn as steel (the texture through the pattern) or
   as ink outlines, at its own scale. Each square is cut into SUB × SUB smaller
   squares, and a share of those is left empty.

   The settings come from the layout editor; css/layout.css carries them on
   each area as --tp-draw, --tp-outlines, --tp-empty, --tp-holes, --tp-blocks,
   --tp-scale, --tp-seed (and --tp-rows on the main pattern).
   ===================================================================== */
(function (root) {
  "use strict";
  const SUB = 2;                          // each square → SUB × SUB smaller squares
  const ZOOMS = [1, 1, 1, 1.5, 2, 2.4];   // "varied" scale: drawn smaller (denser) above 1
  const INNER = [3, 6];                   // "edges": how many empty squares sit in the middle (min, max)

  const AREA = { draw: "mix", outlines: .2, empty: .48, holes: "edges", blocks: "mixed", scale: "varied", seed: "visit" };
  const DEFAULTS = {
    stage: Object.assign({}, AREA, { rows: 7 }),                                                   // the main pattern
    strip: { draw: "fill", outlines: .2, empty: .25, holes: "scatter", blocks: "rows", scale: "1", seed: "visit" },   // right-hand strip, home
    stripSection: { draw: "outline", outlines: .2, empty: .25, holes: "scatter", blocks: "rows", scale: "1", seed: "visit" },
    area: AREA                                                                                     // extra pattern areas
  };
  const NAMES = ["draw", "outlines", "empty", "holes", "blocks", "scale", "seed", "rows"];
  const NUMERIC = { outlines: 1, empty: 1, rows: 1 };

  // "visit": a new arrangement on each visit; a number: always the same one
  const VISIT = (Math.random() * 4294967296) >>> 0;
  function rng(seed, key) {
    let s = /^\d+$/.test(String(seed)) ? Number(seed) >>> 0 : VISIT;
    for (const ch of String(key)) s = (Math.imul(s ^ ch.charCodeAt(0), 2654435761) + 1013904223) >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // "scatter": empty squares anywhere, exactly that share of them
  function scatter(R, cols, rows, share) {
    const n = cols * rows, idx = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const keep = Array.from({ length: rows }, () => new Array(cols).fill(true));
    for (let i = 0; i < Math.round(n * share); i++) keep[Math.floor(idx[i] / cols)][idx[i] % cols] = false;
    return keep;
  }

  /* "edges": the empty squares are bitten out of the area's edges, each bite
     likelier beside an earlier one and unlikelier the deeper it goes, so the
     area takes a ragged shape; a few more sit singly in the middle.
     Returns rows of booleans: true = kept. */
  function shapeMask(R, cols, rows, share) {
    const keep = Array.from({ length: rows }, () => new Array(cols).fill(true));
    const depth = (i, j) => Math.min(i, j, cols - 1 - i, rows - 1 - j);
    const gone = (i, j) => i < 0 || j < 0 || i >= cols || j >= rows || !keep[j][i];
    const total = Math.round(cols * rows * share);
    const inner = Math.min(total, INNER[0] + Math.floor(R() * (INNER[1] - INNER[0] + 1)));
    for (let k = 0; k < total - inner; k++) {
      let sum = 0; const cand = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        if (!keep[j][i]) continue;
        const open = gone(i - 1, j) + gone(i + 1, j) + gone(i, j - 1) + gone(i, j + 1);
        if (!open) continue;                              // only squares on the current outline
        const w = (1 + open) / Math.pow(1 + depth(i, j), 2.2);
        cand.push([i, j, w]); sum += w;
      }
      let x = R() * sum, pick = cand[cand.length - 1];
      for (const c of cand) { x -= c[2]; if (x <= 0) { pick = c; break; } }
      keep[pick[1]][pick[0]] = false;
    }
    // a few holes in the middle, apart from each other and from the bites: a small square,
    // or now and then a whole module (SUB × SUB of them)
    const deep = Math.max(2, Math.floor(Math.min(cols, rows) / 4));
    for (let k = 0, tries = 0; k < inner && tries < 400; tries++) {
      const big = R() < .4, s = big ? SUB : 1;
      let i = Math.floor(R() * cols), j = Math.floor(R() * rows);
      if (big) { i -= i % SUB; j -= j % SUB; }
      if (depth(i, j) < deep || depth(i + s - 1, j + s - 1) < deep - 1) continue;
      let clear = true;
      for (let b = -1; b <= s; b++) for (let a = -1; a <= s; a++) if (gone(i + a, j + b)) clear = false;
      if (!clear) continue;
      for (let b = 0; b < s; b++) for (let a = 0; a < s; a++) keep[j + b][i + a] = false;
      k++;
    }
    return keep;
  }

  // which squares make up each block
  function group(R, rows, cols, how) {
    if (how === "one") return [[{ c: 0, r: 0, cw: cols, rh: rows }]];
    if (how === "rows") return Array.from({ length: rows }, (_, r) => [{ c: 0, r, cw: cols, rh: 1 }]);
    const used = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const free = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && !used[r][c];
    const H = (c, r) => ({ c, r, cw: 2, rh: 1 }), V = (c, r) => ({ c, r, cw: 1, rh: 2 }), Q = (c, r) => ({ c, r, cw: 1, rh: 1 });
    const out = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!free(r, c)) continue;
      let parts = null;
      if (how === "mixed") {                                // squares, 2 × 2, bars and L shapes
        const right = free(r, c + 1), down = free(r + 1, c), x = R();
        if (x < .14 && right && down && free(r + 1, c + 1)) parts = [{ c, r, cw: 2, rh: 2 }];
        if (!parts && x < .3) {
          const fits = [];
          if (right && down) fits.push([H(c, r), V(c, r)]);
          if (right && free(r + 1, c + 1)) fits.push([H(c, r), V(c + 1, r)]);
          if (down && free(r + 1, c + 1)) fits.push([V(c, r), H(c, r + 1)]);
          if (down && free(r + 1, c - 1)) fits.push([V(c, r), H(c - 1, r + 1)]);
          if (fits.length) parts = fits[Math.floor(R() * fits.length)];
        }
        if (!parts && x < .52 && right) parts = [H(c, r)];
        if (!parts && x < .62 && down) parts = [V(c, r)];
      }
      if (!parts) parts = [Q(c, r)];
      for (const q of parts) for (let i = 0; i < q.cw; i++) for (let j = 0; j < q.rh; j++) used[q.r + j][q.c + i] = true;
      out.push(parts);
    }
    return out;
  }

  /* The plan for one area: o = settings + rows, cols and a key naming the area.
     Returns blocks: { row, parts: [{ c, r, cw, rh, keep }], style (0 steel, 1 outline), zoom, k }.
     keep lists each part's smaller squares, row by row (cw·SUB × rh·SUB): true = drawn. */
  const cache = {};
  function plan(o) {
    const p = Object.assign({}, AREA, o);
    const id = JSON.stringify([p.draw, p.outlines, p.empty, p.holes, p.blocks, p.scale, p.seed, p.rows, p.cols, p.key]);
    if (cache[id]) return cache[id];
    const R = rng(p.seed, p.key + ":" + p.rows + ":" + p.cols);
    const blocks = group(R, p.rows, p.cols, p.blocks).map(parts => {
      const zoom = p.scale === "varied" ? ZOOMS[Math.floor(R() * ZOOMS.length)] : (Number(p.scale) || 1);
      return { row: parts[0].r, parts, style: p.draw === "outline" ? 1 : 0, zoom, k: (.55 + R() * 1.1) / Math.sqrt(zoom) };
    });
    const share = Math.min(.95, Math.max(0, Number(p.empty) || 0)), W = p.cols * SUB, Hh = p.rows * SUB;
    const mask = p.holes === "scatter" ? scatter(R, W, Hh, share) : shapeMask(R, W, Hh, share);
    for (const b of blocks) for (const q of b.parts) {
      const cw = q.cw * SUB, rh = q.rh * SUB;
      q.keep = Array.from({ length: cw * rh }, (_, t) => mask[q.r * SUB + Math.floor(t / cw)][q.c * SUB + t % cw]);
    }
    if (p.draw === "mix") {                                  // that share of the blocks, picked at random, drawn as outlines
      const n = Math.round(blocks.length * Math.min(1, Math.max(0, Number(p.outlines) || 0))), pick = [...blocks.keys()];
      for (let i = 0; i < n && pick.length; i++) blocks[pick.splice(Math.floor(R() * pick.length), 1)[0]].style = 1;
    }
    for (const b of blocks) if (b.style === 1) b.zoom = Math.min(b.zoom, 1.5);   // fine outlines turn to noise when very small
    return (cache[id] = blocks);
  }

  // the settings an element carries in css/layout.css (any not set: the defaults for its kind)
  function fromStyle(el, kind) {
    const out = Object.assign({}, DEFAULTS[kind] || AREA);
    if (!el) return out;
    const cs = getComputedStyle(el);
    for (const n of NAMES) {
      const v = cs.getPropertyValue("--tp-" + n).trim();
      if (v) out[n] = NUMERIC[n] ? Number(v) : v;
    }
    return out;
  }
  // the declarations the layout editor writes for an element's settings
  const toCss = p => NAMES.filter(n => p && p[n] != null && p[n] !== "").map(n => `--tp-${n}: ${p[n]};`);

  root.TP_TILES = { SUB, DEFAULTS, NAMES, plan, fromStyle, toCss };
})(window);
