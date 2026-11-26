/* =====================================================================
   explorations/shared/postcard.js — turning an exploration into a postcard.

   The front is the piece as it stands (each page hands over a canvas of its frame); the back is drawn
   from js/postcard.js (window.TP_POSTCARD), which the layout editor (admin/layout.html → Postcard) writes:
   where each part of the back sits, its words and type, and the collection of quotes one is picked from.
   The result is a two-page PDF, 6 × 4 inches, both sides lying down, written here, no library: each page
   one JPEG at 300 dpi. The Postcard button opens a small sheet with the card: Download, and Share or email.

     TPPostcard.attach(button, () => canvasOfTheFront, "flux", opts)   // a Postcard button. opts: { stamp: path }
                     // a picture for the stamp rather than the front; { portrait: "rotate" } an upright front turned to
                     // fill the card; { bg } the card's colour around an upright front
     TPPostcard.make(frontCanvas, "flux")                         // or straight away
     TPPostcard.drawBack(ctx, w, h, config, { front, quote })     // the back on any canvas (the editor uses it)
     TPPostcard.textFront(title, paragraphs, w, h)                // a typeset front, for a piece still in progress
   ===================================================================== */
(function () {
  "use strict";
  const me = document.currentScript && document.currentScript.src;
  const ROOT = new URL("../../", me || location.href);                 // the site's root
  const at = p => /^(data:|blob:|https?:)/.test(p) ? p : new URL(p, ROOT).href;

  /* the back as the template has it; js/postcard.js replaces it once the layout editor has saved one */
  const DEFAULT = {
    paper: "#fcfbf9",
    els: [
      { id: "title", label: "Title", type: "text", x: .075, y: .084, w: .42, h: .07, font: "display", size: .047, lh: 1.1, color: "ink", align: "left", text: "Turning Point" },
      { id: "sub", label: "Subtitle", type: "text", x: .075, y: .132, w: .42, h: .04, font: "text-italic", size: .025, lh: 1.2, color: "ink", align: "left", text: "An installation project by Anant University." },
      { id: "rule", label: "Divider", type: "rule", x: .499, y: .089, w: .002, h: .804, color: "line" },
      { id: "linesL", label: "Lines, left", type: "lines", x: .075, y: .355, w: .394, h: .235, n: 6, color: "line" },
      { id: "linesR", label: "Lines, right", type: "lines", x: .543, y: .355, w: .389, h: .235, n: 6, color: "line" },
      { id: "stamp", label: "Stamp", type: "image", x: .822, y: .088, w: .111, h: .223, src: "front", grey: true },
      { id: "quote", label: "Quote", type: "quote", x: .075, y: .66, w: .36, h: .23, font: "text-italic", size: .0225, lh: 1.3, color: "ink", align: "left" },
      { id: "logo", label: "Logo", type: "image", x: .767, y: .804, w: .166, h: .089, src: "assets/img/postcard/anu-logo-line.png", fit: "contain" }
    ],
    quotes: [
      { text: "Turning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold;\nMere anarchy is loosed upon the world,", by: "WB Yeats, The Second Coming." }
    ],
    pick: "random"                                                       // "random", or the number of a quote (0, 1, …)
  };
  const COLOURS = { ink: "#1f1c19", grey: "#5d5853", accent: "#449ad4", line: "#b9b4ae", white: "#ffffff" };
  const FONTS = {                                                       // canvas font for each face (size added): the site's type
    "display": "700 {s}px 'Noto Serif', Georgia, serif",
    "display-italic": "italic 700 {s}px 'Noto Serif', Georgia, serif",
    "text": "400 {s}px Roboto, Arial, sans-serif",
    "text-light": "300 {s}px Roboto, Arial, sans-serif",
    "text-italic": "italic 300 {s}px Roboto, Arial, sans-serif"
  };
  const config = () => window.TP_POSTCARD && Array.isArray(window.TP_POSTCARD.els) ? window.TP_POSTCARD : DEFAULT;

  /* the site's fonts (Noto Serif for titles, Roboto for text, from Google Fonts), loaded before drawing */
  const GF = "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,700;1,700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap";
  let fontsP = null;
  function fonts() {
    if (fontsP) return fontsP;
    let link = [...document.querySelectorAll("link[rel=stylesheet]")].find(l => l.href === GF);
    const css = link ? Promise.resolve() : new Promise(res => {
      link = document.createElement("link"); link.rel = "stylesheet"; link.href = GF;
      link.onload = link.onerror = () => res(); document.head.appendChild(link);
    });
    const faces = Object.values(FONTS).map(f => f.replace("{s}", "20"));
    fontsP = css.then(() => Promise.all(faces.map(f => document.fonts.load(f).catch(() => {})))).catch(() => {});
    return fontsP;
  }
  const imgCache = {};
  function image(src) {
    if (imgCache[src]) return imgCache[src];
    return (imgCache[src] = new Promise(res => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => res(null); i.src = at(src); }));
  }
  function pickQuote(cfg, n) {
    const q = (cfg.quotes || []).filter(x => x && x.text && x.text.trim());
    if (!q.length) return null;
    if (n != null && q[n]) return q[n];
    const k = Number(cfg.pick);
    return cfg.pick !== "random" && isFinite(k) && q[k] ? q[k] : q[Math.floor(Math.random() * q.length)];
  }

  // words wrapped to a width; a line break in the text starts a new line
  function wrap(ctx, text, width) {
    const out = [];
    for (const para of String(text).split("\n")) {
      let line = "";
      for (const w of para.split(/\s+/).filter(Boolean)) {
        const t = line ? line + " " + w : w;
        if (line && ctx.measureText(t).width > width) { out.push(line); line = w; } else line = t;
      }
      out.push(line);
    }
    return out;
  }
  function textBlock(ctx, lines, x, y, w, size, lh, align) {
    ctx.textBaseline = "alphabetic";
    lines.forEach((l, i) => {
      const by = y + size * 0.9 + i * size * lh;
      if (align === "right") { ctx.textAlign = "right"; ctx.fillText(l, x + w, by); }
      else if (align === "center") { ctx.textAlign = "center"; ctx.fillText(l, x + w / 2, by); }
      else { ctx.textAlign = "left"; ctx.fillText(l, x, by); }
    });
    return lines.length ? size * 0.9 + (lines.length - 1) * size * lh + size * 0.25 : 0;
  }
  function cover(ctx, img, x, y, w, h, contain) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = contain ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, contain ? x + (w - dw) / 2 : x + (w - dw) / 2, contain ? y + (h - dh) / 2 : y + (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  /* the back, on ctx (w × h px). opts.front: the front's canvas (for a stamp cut from it); opts.stamp: a picture for
     the stamp instead (a path); opts.quote: a quote to use */
  async function drawBack(ctx, W, H, cfg = config(), opts = {}) {
    await fonts();
    const quote = opts.quote || pickQuote(cfg);
    const imgs = {};
    for (const e of cfg.els) if (e.type === "image" && e.src && e.src !== "front" && !e.hidden) imgs[e.src] = await image(e.src);
    const stamp = opts.stamp ? await image(opts.stamp) : null;
    ctx.save();
    ctx.fillStyle = cfg.paper || DEFAULT.paper; ctx.fillRect(0, 0, W, H);
    for (const e of cfg.els) {
      if (e.hidden) continue;
      const x = e.x * W, y = e.y * H, w = e.w * W, h = e.h * H, col = COLOURS[e.color] || e.color || COLOURS.ink;
      if (e.type === "text" || e.type === "quote") {
        const size = (e.size || .03) * H;
        ctx.font = (FONTS[e.font] || FONTS.text).replace("{s}", size.toFixed(2)); ctx.fillStyle = col;
        if (e.type === "text") textBlock(ctx, wrap(ctx, e.text || "", w), x, y, w, size, e.lh || 1.2, e.align);
        else if (quote) {
          const used = textBlock(ctx, wrap(ctx, quote.text, w), x, y, w, size, e.lh || 1.3, e.align);
          if (quote.by) {
            const by = "- " + quote.by.replace(/^[-–—]\s*/, "");
            const lines = wrap(ctx, by, w), bh = lines.length * size * (e.lh || 1.3);
            textBlock(ctx, lines, x, Math.max(y + used + size * 1.2, y + h - bh), w, size, e.lh || 1.3, "right");
          }
        }
      } else if (e.type === "rule") {
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, H * .0016);
        ctx.beginPath();
        if (h >= w) { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); } else { ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); }
        ctx.stroke();
      } else if (e.type === "lines") {
        const n = Math.max(1, e.n | 0);
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, H * .0013);
        ctx.beginPath();
        for (let i = 0; i < n; i++) { const ly = Math.round(n === 1 ? y + h : y + i * h / (n - 1)) + .5; ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); }
        ctx.stroke();
      } else if (e.type === "image") {
        const src = e.src === "front" ? (stamp || opts.front) : imgs[e.src];
        if (!src) { ctx.fillStyle = "rgba(31,28,25,.08)"; ctx.fillRect(x, y, w, h); continue; }
        if (e.grey) ctx.filter = "grayscale(1) contrast(1.1)";
        if (e.src === "front" && !stamp) {                             // the stamp: the middle of the front, cut to the box's shape
          const fw = src.width, fh = src.height, r = w / h;
          let sw = fw * .42, sh = sw / r; if (sh > fh * .8) { sh = fh * .8; sw = sh * r; }
          ctx.drawImage(src, (fw - sw) / 2, (fh - sh) / 2, sw, sh, x, y, w, h);
        } else cover(ctx, src, x, y, w, h, e.fit === "contain");
        ctx.filter = "none";
      }
    }
    ctx.restore();
  }

  /* a front for a piece still in progress: its title and words, typeset on the paper */
  async function textFront(title, paras, W = 1800, H = 1200) {
    await fonts();
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), m = Math.min(W, H) * .085;
    g.fillStyle = "#fcfbf9"; g.fillRect(0, 0, W, H); g.fillStyle = COLOURS.ink;
    const ts = Math.min(W, H) * .06;
    g.font = FONTS.display.replace("{s}", ts.toFixed(1));
    let y = m + textBlock(g, [title], m, m, W - 2 * m, ts, 1.1, "left") + ts * .6;
    // as many paragraphs as fit, at a size that fits the first
    let size = Math.min(W, H) * .032, lines;
    for (; size > Math.min(W, H) * .018; size *= .94) {
      g.font = FONTS.text.replace("{s}", size.toFixed(1));
      lines = wrap(g, paras[0], W - 2 * m);
      if (y + lines.length * size * 1.45 < H - m) break;
    }
    for (const p of paras) {
      const ls = wrap(g, p, W - 2 * m);
      if (y + ls.length * size * 1.45 > H - m) break;
      y += textBlock(g, ls, m, y, W - 2 * m, size, 1.45, "left") + size * .8;
    }
    return cv;
  }

  /* ---------- the PDF ---------- */
  const toJpeg = cv => new Promise(r => cv.toBlob(b => b.arrayBuffer().then(a => r(new Uint8Array(a))), "image/jpeg", 0.93));
  function pdf(pages) {   // pages: [{ bytes (JPEG), w, h (px), pw, ph (pt) }]
    const enc = new TextEncoder(), parts = [], offs = [];
    let len = 0;
    const put = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); body(); put("\nendobj\n"); };
    put("%PDF-1.4\n"); put(new Uint8Array([37, 226, 227, 207, 211, 10]));
    obj(1, () => put("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => put(`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${pages.length} >>`));
    pages.forEach((im, i) => {
      const n = 3 + i * 3, draw = `q ${im.pw} 0 0 ${im.ph} 0 0 cm /Im${i} Do Q`;
      obj(n, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${im.pw} ${im.ph}] /Resources << /XObject << /Im${i} ${n + 2} 0 R >> >> /Contents ${n + 1} 0 R >>`));
      obj(n + 1, () => put(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`));
      obj(n + 2, () => {
        put(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);
        put(im.bytes); put("\nendstream");
      });
    });
    const xref = len, count = 3 + pages.length * 3;
    put(`xref\n0 ${count}\n0000000000 65535 f \n` + offs.slice(1).map(o => String(o).padStart(10, "0") + " 00000 n \n").join(""));
    put(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: "application/pdf" });
  }

  /* The postcard from a canvas of the front. The card is always 6 × 4 in, lying down, as its back is. A front of
     another shape (an upright frame, on a phone) is fitted onto it: opts.portrait "rotate" turns it a quarter turn
     to fill the card (for a piece that reads either way), otherwise it sits whole in the middle on opts.bg. */
  const LONG = 1800, SHORT = 1200, PT_LONG = 6 * 72, PT_SHORT = 4 * 72;
  async function build(front, opts = {}) {
    const f = document.createElement("canvas"); f.width = LONG; f.height = SHORT;
    const g = f.getContext("2d");
    g.fillStyle = opts.bg || "#ffffff"; g.fillRect(0, 0, LONG, SHORT);
    const fw = front.width, fh = front.height;
    if (fh > fw * 1.05 && opts.portrait === "rotate") {
      const s = Math.max(LONG / fh, SHORT / fw);
      g.save(); g.translate(LONG / 2, SHORT / 2); g.rotate(-Math.PI / 2); g.drawImage(front, -fw * s / 2, -fh * s / 2, fw * s, fh * s); g.restore();
    } else {
      const s = fh > fw * 1.05 ? Math.min(LONG / fw, SHORT / fh) : Math.max(LONG / fw, SHORT / fh);
      g.drawImage(front, (LONG - fw * s) / 2, (SHORT - fh * s) / 2, fw * s, fh * s);
    }
    const b = document.createElement("canvas"); b.width = LONG; b.height = SHORT;
    await drawBack(b.getContext("2d"), LONG, SHORT, config(), { front: f, stamp: opts.stamp });
    const blob = pdf([
      { bytes: await toJpeg(f), w: LONG, h: SHORT, pw: PT_LONG, ph: PT_SHORT },
      { bytes: await toJpeg(b), w: LONG, h: SHORT, pw: PT_LONG, ph: PT_SHORT }
    ]);
    const thumb = document.createElement("canvas"); thumb.width = 600; thumb.height = 400;
    thumb.getContext("2d").drawImage(f, 0, 0, 600, 400);
    return { blob, preview: thumb.toDataURL("image/jpeg", 0.85) };
  }
  function download(blob, file) {
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = file; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function make(front, name = "turning-point", opts = {}) {
    const r = await build(front, opts); download(r.blob, `turning-point-${name}-postcard.pdf`);
  }

  /* Ready: a small sheet with the card, to download it, or to share or email it. Sharing uses the device's own
     share sheet (phones, and Safari / Edge on computers): Mail, Messages, WhatsApp, Save to Files … with the PDF
     attached. Where that isn't offered, Email downloads the PDF and opens a new email to attach it to. */
  const SITE_URL = "https://turningpoint.anu.edu.in/";
  function sheet(r, name) {
    const file = `turning-point-${name}-postcard.pdf`;
    let pdfFile = null;
    try { pdfFile = new File([r.blob], file, { type: "application/pdf" }); } catch (e) {}
    const canShare = !!(pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] }));
    const page = SITE_URL + "explorations/" + name + "/";
    const subject = "A postcard from Turning Point";
    const words = `I made this postcard in ${name.charAt(0).toUpperCase() + name.slice(1)}, one of the explorations of Turning Point — an installation by Anant National University for the India Art Biennale 2026: ${page}`;
    const el = document.createElement("div");
    el.className = "xsheet"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Your postcard");
    el.innerHTML = `<div class="xsheet__card">
        <img class="xsheet__front" alt="The front of your postcard" src="${r.preview}">
        <p class="xsheet__title">Your postcard</p>
        <p class="xsheet__note">A two-page PDF, 6 × 4 in: the front, and the back to write on.${canShare ? "" : " <span data-note hidden>Your email opens in a moment: attach the PDF that has just downloaded.</span>"}</p>
        <div class="xsheet__btns">
          ${canShare ? `<button type="button" class="primary" data-a="share">Share or email</button>` : ""}
          <button type="button" class="${canShare ? "" : "primary"}" data-a="download">Download</button>
          ${canShare ? "" : `<button type="button" data-a="mail">Email</button>`}
          <button type="button" class="ghost" data-a="close">Close</button>
        </div>
      </div>`;
    const close = () => { el.remove(); removeEventListener("keydown", esc); };
    const esc = e => { if (e.key === "Escape") close(); };
    addEventListener("keydown", esc);
    el.addEventListener("click", async e => {
      if (e.target === el) return close();
      const a = e.target.closest("[data-a]"); if (!a) return;
      if (a.dataset.a === "close") close();
      else if (a.dataset.a === "download") download(r.blob, file);
      else if (a.dataset.a === "share") {
        try { await navigator.share({ files: [pdfFile], title: subject, text: words }); }
        catch (err) { if (err && err.name !== "AbortError") download(r.blob, file); }
      } else if (a.dataset.a === "mail") {
        download(r.blob, file);
        const n = el.querySelector("[data-note]"); if (n) n.hidden = false;
        setTimeout(() => { location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(words + "\n\n(The postcard is attached.)")}`; }, 600);
      }
    });
    document.body.appendChild(el);
    (el.querySelector(".primary") || el.querySelector("button")).focus();
  }
  function attach(btn, getFront, name, opts) {
    if (!btn) return;
    btn.addEventListener("click", async () => {
      if (btn.disabled) return;
      const label = btn.textContent; btn.disabled = true; btn.textContent = "Making…";
      try { const f = await getFront(); if (f) sheet(await build(f, opts), name); }
      catch (e) { console.warn("Postcard failed:", e); }
      btn.disabled = false; btn.textContent = label;
    });
  }

  window.TPPostcard = { DEFAULT, COLOURS, FONTS, config, fonts, drawBack, textFront, build, make, attach, pickQuote };
})();
