/* =====================================================================
   explorations/shared/explore.js — for a piece that isn't built yet: shows the
   description written for it in the content editor (its card on the Explore
   page: "text", and "status") in place of the placeholder, and in About.
   Needs ../../js/content.js loaded first. Remove data-placeholder (or the
   script) once the piece is there.
   ===================================================================== */
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
