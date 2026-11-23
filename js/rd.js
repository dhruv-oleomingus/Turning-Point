/* =====================================================================
   TURNING POINT — reaction–diffusion engine (WebGL2)
   ---------------------------------------------------------------------
   Gray–Scott model on a periodic (tileable) grid. Parameters vary over
   space between a "coral" regime (labyrinths, lines) and a "mitosis"
   regime (dots), and V diffuses anisotropically along a slowly turning
   direction field, giving the mix of tendrils, dashes and dots.

   The state texture holds: r = A, g = B, b = "visited" (where growth has
   reached — the steel texture is revealed there), a = unused.

   Rendering draws the pattern into any number of screen rectangles
   ("strips"), each with its own offset into the infinite, wrapping
   pattern. Cut areas (high B) are transparent; the rest is filled with
   the steel texture image.

   Usage:
     const rd = new TurningPattern(canvas, { texture: "assets/img/texture.jpg" });
     if (!rd.ok) { ...fallback... }
     rd.start(simW, simH, cellPx);
     rd.seed(x, y, radius);        // cell units
     rd.step(n);
     rd.render(rects, { fill });   // rects: [{x,y,w,h, ox,oy, tx,ty, a, style, zoom}]; any number (drawn in batches)
     per rect: style 0 = steel texture, 1 = ink outlines, 2 = clay relief
     with ambient occlusion; zoom > 1 shows the pattern smaller (denser).
     options: clear:false draws over what is there; tint:[r,g,b] uses a
     flat colour; invert:true draws the cut shapes; vignette:[x,y,r];
     ramp:[x0,x1,a0,a1] fades opacity from a0 to a1 between x0 and x1;
     pale:0..1 lightens the texture towards white; mono:true renders it
     in black and white; rim:0..1 darkens the edge just outside each cut.
     rd.ripple(x, y, R) ripples a new pattern out from (x, y) to radius R.
     rd.seed(x, y, r, -2) erases a disc completely (also where it had grown).
     Two instances may share one canvas (they share its WebGL context).
   ===================================================================== */
(function () {
  "use strict";

  const VS = `#version 300 es
  in vec2 aPos;
  void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const MAX_SEEDS = 32;
  const MAX_RECTS = 60;

  const SIM_FS = `#version 300 es
  precision highp float;
  precision highp int;
  uniform sampler2D uState;
  uniform sampler2D uParams;
  uniform ivec2 uSize;
  uniform vec4 uSeeds[${MAX_SEEDS}];
  uniform int uSeedCount;
  uniform vec4 uRegime; // coral F,K  mitosis F,K
  uniform vec4 uRip[4];  // ripples: centre xy (cells), front radius, band width
  uniform int uRipN;
  out vec4 o;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec4 S(ivec2 p){ return texelFetch(uState, (p + uSize) % uSize, 0); }

  void main(){
    ivec2 p = ivec2(gl_FragCoord.xy);
    vec4 c  = S(p);
    vec4 l  = S(p + ivec2(-1, 0)), r  = S(p + ivec2(1, 0));
    vec4 d  = S(p + ivec2( 0,-1)), u  = S(p + ivec2(0, 1));
    vec4 lu = S(p + ivec2(-1, 1)), ru = S(p + ivec2(1, 1));
    vec4 ld = S(p + ivec2(-1,-1)), rd = S(p + ivec2(1,-1));

    vec4 prm = texelFetch(uParams, p, 0);
    float m  = prm.r;
    float th = prm.g * 6.2831853;
    float an = prm.b;
    float F = mix(uRegime.x, uRegime.z, m);
    float K = mix(uRegime.y, uRegime.w, m);

    float lapA = l.r + r.r + d.r + u.r - 4.0 * c.r;

    float bxx = l.g + r.g - 2.0 * c.g;
    float byy = d.g + u.g - 2.0 * c.g;
    float bxy = (ru.g - rd.g - lu.g + ld.g) * 0.25;
    vec2 e = vec2(cos(th), sin(th));
    float dee = e.x*e.x*bxx + 2.0*e.x*e.y*bxy + e.y*e.y*byy;
    float dpp = e.y*e.y*bxx - 2.0*e.x*e.y*bxy + e.x*e.x*byy;
    float lapB = (1.0 + an) * dee + (1.0 - an) * dpp;

    float A = c.r, B = c.g;
    float abb = A * B * B;
    A += 0.2097 * lapA - abb + F * (1.0 - A);
    B += 0.105  * lapB + abb - (F + K) * B;

    vec2 fp = vec2(p) + 0.5;
    vec2 sz = vec2(uSize);
    bool wipe = false;
    for (int i = 0; i < ${MAX_SEEDS}; i++) {
      if (i >= uSeedCount) break;
      vec4 s = uSeeds[i];
      vec2 dd = abs(fp - s.xy);
      dd = min(dd, sz - dd);
      if (dot(dd, dd) < s.z * s.z) {
        if (s.w >= 0.0) { A = 0.5; B = 0.5; }
        else            { A = 1.0; B = 0.0; wipe = wipe || s.w < -1.5; }   // −2 also forgets it was ever grown
      }
    }
    // a ripple: a ring moving outwards clears the old pattern and leaves a
    // sprinkling of seeds behind it, from which the new pattern grows
    for (int i = 0; i < 4; i++) {
      if (i >= uRipN) break;
      vec4 q = uRip[i];
      vec2 dd = abs(fp - q.xy);
      dd = min(dd, sz - dd);
      float d = length(dd);
      if (d < q.z && d > q.z - q.w) {
        if (hash(floor(fp / 3.0) + q.xy) < 0.13) { A = 0.5; B = 0.5; }
        else { A = 1.0; B = 0.0; }
      }
    }

    float vis = wipe ? 0.0 : max(c.b, smoothstep(0.015, 0.09, B));
    o = vec4(clamp(A, 0.0, 1.0), clamp(B, 0.0, 1.0), vis, 1.0);
  }`;

  const DRAW_FS = `#version 300 es
  precision highp float;
  precision highp int;
  uniform sampler2D uState;
  uniform sampler2D uTex;
  uniform ivec2 uSize;
  uniform vec2  uRes;      // canvas size, device px
  uniform float uDpr;
  uniform float uCell;     // css px per sim cell
  uniform float uTexPx;    // css px per texture tile
  uniform float uFill;     // 0..1 — reveal texture everywhere
  uniform float uThresh;   // cut threshold on B
  uniform int   uHasTex;
  uniform vec3  uTint;     // flat colour instead of the texture
  uniform int   uTintOn;
  uniform int   uInvert;   // 1 = draw the cut shapes instead of the steel
  uniform vec3  uVig;      // radial fade: centre xy, radius (css px); z = 0 → off
  uniform vec4  uRamp;     // horizontal fade: from x0 to x1 (css px), opacity a0 → a1
  uniform float uPale;     // 0..1 — mix the texture towards white
  uniform int   uMono;     // 1 = black and white
  uniform float uRim;      // how dark the rim just outside each cut is (0 = none)
  uniform vec4  uRects[${MAX_RECTS}];  // x0,y0,x1,y1 (css px)
  uniform vec4  uOffs[${MAX_RECTS}];   // pattern offset xy (css px), texture offset zw (uv)
  uniform vec4  uStyle[${MAX_RECTS}];  // style (0 steel, 1 outline, 2 clay), zoom, opacity
  uniform int   uCount;
  out vec4 o;

  vec4 samp(vec2 c){
    vec2 sz = vec2(uSize);
    c = mod(c - 0.5, sz);
    ivec2 i0 = ivec2(floor(c));
    vec2 f = c - vec2(i0);
    ivec2 i1 = i0 + 1;
    if (i1.x >= uSize.x) i1.x = 0;
    if (i1.y >= uSize.y) i1.y = 0;
    vec4 a = texelFetch(uState, ivec2(i0.x, i0.y), 0);
    vec4 b = texelFetch(uState, ivec2(i1.x, i0.y), 0);
    vec4 cc= texelFetch(uState, ivec2(i0.x, i1.y), 0);
    vec4 d = texelFetch(uState, ivec2(i1.x, i1.y), 0);
    return mix(mix(a, b, f.x), mix(cc, d, f.x), f.y);
  }

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }

  void main(){
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
    int idx = -1;
    for (int i = 0; i < ${MAX_RECTS}; i++) {
      if (i >= uCount) break;
      vec4 r = uRects[i];
      if (p.x >= r.x && p.y >= r.y && p.x < r.z && p.y < r.w) { idx = i; break; }
    }
    if (idx < 0) { o = vec4(0.0); return; }

    vec4 of = uOffs[idx];
    vec4 sty = uStyle[idx];
    vec2 q = p + of.xy;                 // pattern space, css px
    vec2 sc = q * sty.y / uCell;        // sim cells (zoom > 1: more pattern per px)
    vec4 st = samp(sc);
    float B = st.g;
    float vis = clamp(max(st.b, uFill), 0.0, 1.0);

    float w = max(fwidth(B) * 0.75, 0.006);
    float cut = smoothstep(uThresh - w, uThresh + w, B);

    vec3 col;
    if (uTintOn == 1) {
      col = uTint;
    } else if (uHasTex == 1) {
      col = texture(uTex, q / uTexPx + of.zw).rgb;
    } else {
      float n = vnoise(q * 0.012) * 0.6 + vnoise(q * 0.05) * 0.4;
      col = mix(vec3(0.66, 0.36, 0.16), vec3(0.88, 0.62, 0.30), n);
    }
    if (uMono == 1) {
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = vec3(clamp((l - 0.5) * 1.25 + 0.47, 0.0, 1.0));
    }
    col = mix(col, vec3(1.0), uPale);
    // darkened, "burnt" rim just outside each cut
    if (uTintOn == 0 && uInvert == 0) {
      float rim = smoothstep(uThresh * 0.35, uThresh, B) * (1.0 - cut);
      col *= 1.0 - uRim * rim;
    }

    float shape = uInvert == 1 ? cut : vis * (1.0 - cut);
    if (sty.x > 1.5) {
      // clay: the plate as a soft relief (cuts are recesses), lit from the upper
      // left, with ambient occlusion gathering in the channels and along walls
      #define HGT(c) (1.0 - smoothstep(uThresh - 0.09, uThresh + 0.09, samp(c).g))
      float h  = HGT(sc);
      float hl = HGT(sc - vec2(1.0, 0.0)), hr = HGT(sc + vec2(1.0, 0.0));
      float hu = HGT(sc - vec2(0.0, 1.0)), hd = HGT(sc + vec2(0.0, 1.0));
      vec3 nrm = normalize(vec3((hl - hr) * 1.5, (hu - hd) * 1.5, 1.0));
      float dif = max(dot(nrm, normalize(vec3(-0.55, -0.65, 0.6))), 0.0);
      float near = 0.0, far = 0.0;
      for (int k = 0; k < 6; k++) {
        float a = float(k) * 1.0472;
        vec2 dir = vec2(cos(a), sin(a));
        near += HGT(sc + dir * 2.5);
        far  += HGT(sc + dir * 6.0);
      }
      float occ = max(0.0, near / 6.0 - h) * 0.65 + max(0.0, far / 6.0 - h) * 0.5;
      float ao = 1.0 - clamp(occ, 0.0, 0.8);
      ao *= mix(0.86, 1.0, h);                          // the floor sits in shade
      col = vec3(0.90, 0.87, 0.81) * (0.50 + 0.62 * dif) * ao;
      if (uMono == 1) col = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
      shape = vis;
    } else if (sty.x > 0.5) {
      // outline: an ink line along the edge of every cut
      float g = max(fwidth(B), 1e-5);
      float dpx = abs(B - uThresh) / g;                 // distance to the edge, device px
      shape = vis * (1.0 - smoothstep(0.55 * uDpr, 0.55 * uDpr + 1.0, dpx));
      col = vec3(0.13, 0.13, 0.12);
    }
    if (uVig.z > 0.0) shape *= 1.0 - smoothstep(uVig.z * 0.4, uVig.z, distance(p, uVig.xy));
    if (uRamp.y > uRamp.x) shape *= mix(uRamp.z, uRamp.w, smoothstep(uRamp.x, uRamp.y, p.x));
    float a = shape * sty.z;
    o = vec4(col * a, a);
  }`;

  /* ---------- small helpers ---------- */
  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  function program(gl, fs) {
    const v = compile(gl, gl.VERTEX_SHADER, VS), f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, "");
      u[name] = gl.getUniformLocation(p, info.name);
    }
    return { p, u };
  }

  /* Seeded RNG + periodic value noise for the parameter field */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function periodicNoise(W, H, cellSize, seed) {
    const R = rng(seed);
    const gx = Math.max(2, Math.round(W / cellSize)), gy = Math.max(2, Math.round(H / cellSize));
    const lat = new Float32Array(gx * gy);
    for (let i = 0; i < lat.length; i++) lat[i] = R();
    const out = new Float32Array(W * H);
    const sm = t => t * t * t * (t * (t * 6 - 15) + 10);
    let mn = 1e9, mx = -1e9;
    for (let y = 0; y < H; y++) {
      const fy = y / H * gy, iy = Math.floor(fy), ty = sm(fy - iy), y0 = iy % gy, y1 = (iy + 1) % gy;
      for (let x = 0; x < W; x++) {
        const fx = x / W * gx, ix = Math.floor(fx), tx = sm(fx - ix), x0 = ix % gx, x1 = (ix + 1) % gx;
        const a = lat[y0 * gx + x0], b = lat[y0 * gx + x1], c = lat[y1 * gx + x0], d = lat[y1 * gx + x1];
        const v = (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
        out[y * W + x] = v;
        if (v < mn) mn = v; if (v > mx) mx = v;
      }
    }
    const k = 1 / Math.max(1e-6, mx - mn);
    for (let i = 0; i < out.length; i++) out[i] = (out[i] - mn) * k;
    return out;
  }

  /* ===================================================================== */
  class TurningPattern {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.opts = Object.assign({
        texture: null,
        texturePx: 720,       // css px per texture tile
        threshold: 0.22,
        seed: 7,
        dotBias: 0,           // −1 … +1 : more lines … more dots
        anisotropy: 0.5,
        regime: [0.0545, 0.062, 0.0367, 0.0649]
      }, opts);
      this.ok = false;
      this.hasTex = false;
      this.seeds = [];
      this.ripples = [];
      this.steps = 0;
      this.dpr = 1;
      const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
      if (!gl) return;
      this.gl = gl;

      // Pick a renderable float format
      if (gl.getExtension("EXT_color_buffer_float")) this.fmt = gl.RGBA32F;
      else if (gl.getExtension("EXT_color_buffer_half_float")) this.fmt = gl.RGBA16F;
      else return;

      this.sim = program(gl, SIM_FS);
      this.draw = program(gl, DRAW_FS);
      if (!this.sim || !this.draw) return;

      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      // Steel texture
      this.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([190, 110, 50, 255]));
      if (this.opts.texture) this.loadTexture(this.opts.texture);

      this.ok = true;
    }

    loadTexture(url) {
      const gl = this.gl, img = new Image();
      img.onload = () => {
        try {
          gl.bindTexture(gl.TEXTURE_2D, this.tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
          this.hasTex = true;
        } catch (e) {
          // Happens when the page is opened straight from disk (file://):
          // browsers refuse local images in WebGL. Run a local server instead.
          console.warn("Texture could not be used (open the site through a web server):", e);
          this.hasTex = false;
        }
        this.onTexture && this.onTexture();
      };
      img.src = url;
    }

    _stateTex(w, h, data) {
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, this.fmt, w, h, 0, gl.RGBA, gl.FLOAT, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      const okFb = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return okFb ? { t, fb } : null;
    }

    /** Create the simulation grid. w,h in cells; cell = css px per cell. */
    start(w, h, cell) {
      const gl = this.gl;
      this.W = w | 0; this.H = h | 0; this.cell = cell;
      const init = new Float32Array(this.W * this.H * 4);
      for (let i = 0; i < this.W * this.H; i++) init[i * 4] = 1;
      this.a = this._stateTex(this.W, this.H, init);
      this.b = this._stateTex(this.W, this.H, init);
      if (!this.a || !this.b) { this.ok = false; return false; }
      this.buildParams();
      this.steps = 0;
      return true;
    }

    /** (Re)build the spatial parameter field. */
    buildParams(o = {}) {
      Object.assign(this.opts, o);
      const gl = this.gl, W = this.W, H = this.H, s = this.opts.seed;
      const nMix = periodicNoise(W, H, 60, s * 13 + 1);
      const nTh  = periodicNoise(W, H, 90, s * 17 + 2);
      const nAn  = periodicNoise(W, H, 70, s * 19 + 4);
      const bias = this.opts.dotBias, aniso = this.opts.anisotropy;
      const px = new Uint8Array(W * H * 4);
      for (let i = 0; i < W * H; i++) {
        const m = Math.min(1, Math.max(0, (nMix[i] - 0.45 + bias * 0.55) * 3.0));
        const an = Math.min(1, Math.max(0, (nAn[i] - 0.4) * 2.0)) * aniso;
        px[i * 4] = m * 255; px[i * 4 + 1] = nTh[i] * 255; px[i * 4 + 2] = an * 255; px[i * 4 + 3] = 255;
      }
      this.paramPx = px;
      this.ripples = [];
      this._uploadParams();
    }

    _uploadParams() {
      const gl = this.gl, W = this.W, H = this.H, px = this.paramPx;
      if (!this.params) this.params = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.params);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    /**
     * A new pattern rippling out from (x, y) (cell units) to radius R: the
     * parameters inside the circle are replaced by a new set (o: seed, dotBias,
     * anisotropy), and a ring sweeps outwards over o.steps steps clearing the
     * old pattern so the new one grows in behind it.
     */
    ripple(x, y, R, o = {}) {
      if (!this.ok || !this.paramPx) return;
      const W = this.W, H = this.H, seed = o.seed ?? (1 + Math.floor(Math.random() * 9999));
      const bias = o.dotBias ?? this.opts.dotBias, aniso = o.anisotropy ?? this.opts.anisotropy;
      const nMix = periodicNoise(W, H, 60, seed * 13 + 1);
      const nTh  = periodicNoise(W, H, 90, seed * 17 + 2);
      const nAn  = periodicNoise(W, H, 70, seed * 19 + 4);
      const px = this.paramPx;
      for (let j = 0; j < H; j++) {
        let dy = Math.abs(j + 0.5 - y); dy = Math.min(dy, H - dy);
        if (dy >= R) continue;
        for (let i = 0; i < W; i++) {
          let dx = Math.abs(i + 0.5 - x); dx = Math.min(dx, W - dx);
          const d = Math.hypot(dx, dy) / R;
          if (d >= 1) continue;
          const t = Math.min(1, Math.max(0, (d - 0.7) / 0.3)), k = 1 - t * t * (3 - 2 * t);
          const n = j * W + i, q = n * 4;
          const m = Math.min(1, Math.max(0, (nMix[n] - 0.45 + bias * 0.55) * 3.0));
          const an = Math.min(1, Math.max(0, (nAn[n] - 0.4) * 2.0)) * aniso;
          px[q]     = px[q]     + (m * 255 - px[q]) * k;
          px[q + 1] = px[q + 1] + (nTh[n] * 255 - px[q + 1]) * k;
          px[q + 2] = px[q + 2] + (an * 255 - px[q + 2]) * k;
        }
      }
      this._uploadParams();
      this.ripples.push({ x, y, R, r: 0, dr: R / (o.steps || 2000), w: o.band || 2.5 });
      if (this.ripples.length > 4) this.ripples.shift();
    }

    /** Clear the grid back to empty. */
    clear() {
      const gl = this.gl;
      const init = new Float32Array(this.W * this.H * 4);
      for (let i = 0; i < this.W * this.H; i++) init[i * 4] = 1;
      for (const s of [this.a, this.b]) {
        gl.bindTexture(gl.TEXTURE_2D, s.t);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.fmt, this.W, this.H, 0, gl.RGBA, gl.FLOAT, init);
      }
      this.steps = 0;
      this.ripples = [];
    }

    /** Queue a seed (cell units). mode −1 erases. */
    seed(x, y, r = 3, mode = 1) {
      if (this.seeds.length < MAX_SEEDS) this.seeds.push([x, y, r, mode]);
    }

    step(n = 1) {
      if (!this.ok) return;
      const gl = this.gl, P = this.sim;
      gl.useProgram(P.p);
      gl.bindVertexArray(this.vao);
      gl.viewport(0, 0, this.W, this.H);
      gl.disable(gl.BLEND);
      gl.disable(gl.SCISSOR_TEST);
      gl.uniform2i(P.u.uSize, this.W, this.H);
      gl.uniform4fv(P.u.uRegime, this.opts.regime);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.params);
      gl.uniform1i(P.u.uParams, 1);
      gl.uniform1i(P.u.uState, 0);
      const seedArr = new Float32Array(MAX_SEEDS * 4);
      this.seeds.forEach((s, i) => seedArr.set(s, i * 4));
      const rip = new Float32Array(16);
      for (let i = 0; i < n; i++) {
        let k = 0;
        for (const q of this.ripples) { if (k < 4 && q.r < q.R) rip.set([q.x, q.y, q.r, q.w], 4 * k++); q.r += q.dr; }
        gl.uniform4fv(P.u.uRip, rip);
        gl.uniform1i(P.u.uRipN, k);
        gl.uniform1i(P.u.uSeedCount, i === 0 ? this.seeds.length : 0);
        if (i === 0) gl.uniform4fv(P.u.uSeeds, seedArr);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.a.t);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.b.fb);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        const t = this.a; this.a = this.b; this.b = t;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.seeds.length = 0;
      this.ripples = this.ripples.filter(q => q.r < q.R);
      this.steps += n;
    }

    /** Match the canvas backing store to its css size. */
    resize(maxDpr = 2) {
      const c = this.canvas;
      this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.round(c.clientWidth * this.dpr), h = Math.round(c.clientHeight * this.dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    }

    /**
     * rects: [{x,y,w,h, ox,oy, tx,ty, a}] in css px (canvas-relative).
     * ox,oy shift the pattern; tx,ty shift the texture (uv); a = opacity.
     */
    render(rects, o = {}) {
      if (!this.ok || !this.a) return;
      // more rects than one pass holds: draw them in batches, each over the last
      if (rects.length > MAX_RECTS) {
        for (let i = 0; i < rects.length; i += MAX_RECTS)
          this.render(rects.slice(i, i + MAX_RECTS), i ? Object.assign({}, o, { clear: false }) : o);
        return;
      }
      const gl = this.gl, P = this.draw;
      const n = Math.min(rects.length, MAX_RECTS);
      const R = new Float32Array(MAX_RECTS * 4), O = new Float32Array(MAX_RECTS * 4), A = new Float32Array(MAX_RECTS * 4);
      for (let i = 0; i < n; i++) {
        const r = rects[i];
        R.set([r.x, r.y, r.x + Math.max(0, r.w), r.y + Math.max(0, r.h)], i * 4);
        O.set([r.ox || 0, r.oy || 0, r.tx || 0, r.ty || 0], i * 4);
        A.set([r.style || 0, r.zoom || 1, r.a == null ? 1 : r.a, 0], i * 4);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.disable(gl.SCISSOR_TEST);
      if (o.clear !== false) {          // pass clear:false to draw over another layer
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (!n) return;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      // only shade the pixels the strips can cover (a thin edge strip is cheap)
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < n; i++) {
        const r = rects[i];
        x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
        x1 = Math.max(x1, r.x + Math.max(0, r.w)); y1 = Math.max(y1, r.y + Math.max(0, r.h));
      }
      const d = this.dpr, H = this.canvas.height;
      const sx = Math.max(0, Math.floor(x0 * d)), sy = Math.max(0, Math.floor(H - y1 * d));
      const sw = Math.min(this.canvas.width, Math.ceil(x1 * d)) - sx, sh = Math.min(H, Math.ceil(H - y0 * d)) - sy;
      if (sw <= 0 || sh <= 0) return;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(sx, sy, sw, sh);
      gl.useProgram(P.p);
      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.a.t);
      gl.uniform1i(P.u.uState, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.uniform1i(P.u.uTex, 1);
      gl.uniform2i(P.u.uSize, this.W, this.H);
      gl.uniform2f(P.u.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(P.u.uDpr, this.dpr);
      gl.uniform1f(P.u.uCell, this.cell);
      gl.uniform1f(P.u.uTexPx, this.opts.texturePx);
      gl.uniform1f(P.u.uFill, o.fill || 0);
      gl.uniform1f(P.u.uThresh, this.opts.threshold);
      gl.uniform1i(P.u.uHasTex, this.hasTex ? 1 : 0);
      gl.uniform3fv(P.u.uTint, o.tint || [0, 0, 0]);
      gl.uniform1i(P.u.uTintOn, o.tint ? 1 : 0);
      gl.uniform1i(P.u.uInvert, o.invert ? 1 : 0);
      gl.uniform3fv(P.u.uVig, o.vignette || [0, 0, 0]);
      gl.uniform4fv(P.u.uRamp, o.ramp || [0, 0, 1, 1]);
      gl.uniform1f(P.u.uPale, o.pale || 0);
      gl.uniform1i(P.u.uMono, o.mono ? 1 : 0);
      gl.uniform1f(P.u.uRim, o.rim == null ? 0.28 : o.rim);
      gl.uniform4fv(P.u.uRects, R);
      gl.uniform4fv(P.u.uOffs, O);
      gl.uniform4fv(P.u.uStyle, A);
      gl.uniform1i(P.u.uCount, n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.SCISSOR_TEST);
      gl.disable(gl.BLEND);
    }
  }

  window.TurningPattern = TurningPattern;
})();
