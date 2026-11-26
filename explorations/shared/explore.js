/* =====================================================================
   explorations/shared/explore.js — for a piece that isn't built yet: shows the
   description written for it in the content editor (its card on the Explore
   page: "text", and "status") in place of the placeholder, and in About.
   Needs ../../js/content.js loaded first. Remove data-placeholder (or the
   script) once the piece is there.
   ===================================================================== */

/* ---------- the frame every piece sits in: the postcard's shape ----------
   TPX.fit({ top, bottom, side }) → { x, y, w, h, upright }: the largest 3:2 frame (2:3 when the window is
   taller than wide) in the window, leaving that much room above, below and at the sides.
   TPX.place(el, r) sets an element to it; TPX.rail(r) puts Back and Postcard beside it, on the left
   (or above it, when there is no room at the side). */
window.TPX = (function () {
  const upright = () => innerHeight > innerWidth;
  function fit(o = {}) {
    const top = o.top || 0, bottom = o.bottom || 0, side = o.side || 0, up = upright();
    const W = innerWidth - 2 * side, H = innerHeight - top - bottom, k = 1.5;
    let w, h;
    if (up) { h = Math.min(H, W * k); w = h / k; } else { w = Math.min(W, H * k); h = w / k; }
    return { x: Math.round((innerWidth - w) / 2), y: Math.round(top + (H - h) / 2), w: Math.round(w), h: Math.round(h), upright: up };
  }
  function place(el, r) { Object.assign(el.style, { position: "fixed", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" }); }
  function rail(r) {
    const el = document.querySelector(".xrail"); if (!el) return;
    const beside = r.x >= 150;
    el.classList.toggle("is-top", !beside);
    if (beside) Object.assign(el.style, { left: "", right: (innerWidth - r.x + 28) + "px", top: (r.y + 2) + "px" });
    else Object.assign(el.style, { right: "", left: Math.max(16, r.x + 2) + "px", top: Math.max(10, r.y - el.offsetHeight - 14) + "px" });
  }
  return { fit, place, rail, upright };
})();

(function () {
  const site = window.SITE; if (!site) return;
  const norm = p => p.replace(/index\.html$/, "").replace(/\/+$/, "/");
  const here = norm(location.pathname), root = new URL("../../", location.href);
  let item = null;
  site.sections.forEach(sec => (sec.items || []).forEach(it => {
    if (it.type === "project" && it.href && norm(new URL(it.href, root).pathname) === here) item = it;
  }));
  if (!item || !item.text) return;
  const work = document.getElementById("work");
  if (work && work.hasAttribute("data-placeholder"))
    work.innerHTML = `<div class="xsoon">${item.status ? `<p class="xsoon__status">${item.status}</p>` : ""}<p class="xsoon__text">${item.text}</p></div>`;
  const info = document.getElementById("info");
  if (info && info.hasAttribute("data-placeholder")) info.innerHTML = `<p>${item.text}</p>`;
})();
