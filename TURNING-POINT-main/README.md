# Turning Point — website

A static site (plain HTML / CSS / JavaScript, no build step). It runs as-is on
GitHub Pages and on any ordinary web server, including the university's.

```
index.html                 the homepage / container
css/style.css              all styling — grid, type, animation
js/content.js              ALL TEXT AND MEDIA — edit here or with the editor
admin/index.html           the editor (see "Editing content")
admin/layout.html          the layout console (grid, gutters, placement)
js/rd.js                   reaction–diffusion engine (WebGL2), shared
js/main.js                 intro sequence, layout of the strips, panels
assets/img/                texture.jpg (the steel fill), images
assets/img/explore/        portrait thumbnails for the five explorations
assets/uploads/            files uploaded through the editor
assets/video/              videos + poster frames
explorations/
  shared/explore.css       shared top bar / info panel for explorations
  metamorphosis/           BUILT copy of the three.js prototype (see below)
  confluence/ flux/ emergence/   placeholder pages to build in
  perforation/             a working interactive piece (touch to grow)
  _template/               copy this to start a new exploration
.nojekyll                  tells GitHub Pages to serve files untouched
```

