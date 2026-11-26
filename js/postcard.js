/* =====================================================================
   js/postcard.js — the back of the explorations' postcards: where each part sits (x, y, w, h as shares of
   the card, sizes as shares of its height), its words and type, and the quotes one is picked from.
   Written by the layout editor (admin/layout.html → Postcard → Save to site); read by
   explorations/shared/postcard.js.
   ===================================================================== */
window.TP_POSTCARD = {
 "paper": "#fcfbf9",
 "els": [
  {
   "id": "title",
   "label": "Title",
   "type": "text",
   "x": 0.075,
   "y": 0.084,
   "w": 0.42,
   "h": 0.07,
   "font": "display",
   "size": 0.047,
   "lh": 1.1,
   "color": "ink",
   "align": "left",
   "text": "Turning Point"
  },
  {
   "id": "sub",
   "label": "Subtitle",
   "type": "text",
   "x": 0.075,
   "y": 0.132,
   "w": 0.42,
   "h": 0.04,
   "font": "text-italic",
   "size": 0.025,
   "lh": 1.2,
   "color": "ink",
   "align": "left",
   "text": "An installation project by Anant University."
  },
  {
   "id": "rule",
   "label": "Divider",
   "type": "rule",
   "x": 0.499,
   "y": 0.089,
   "w": 0.002,
   "h": 0.804,
   "color": "line"
  },
  {
   "id": "linesL",
   "label": "Lines, left",
   "type": "lines",
   "x": 0.075,
   "y": 0.355,
   "w": 0.394,
   "h": 0.235,
   "n": 6,
   "color": "line"
  },
  {
   "id": "linesR",
   "label": "Lines, right",
   "type": "lines",
   "x": 0.543,
   "y": 0.355,
   "w": 0.389,
   "h": 0.235,
   "n": 6,
   "color": "line"
  },
  {
   "id": "stamp",
   "label": "Stamp",
   "type": "image",
   "x": 0.822,
   "y": 0.088,
   "w": 0.111,
   "h": 0.223,
   "src": "front",
   "grey": true
  },
  {
   "id": "quote",
   "label": "Quote",
   "type": "quote",
   "x": 0.075,
   "y": 0.6725,
   "w": 0.3925,
   "h": 0.2175,
   "font": "text-italic",
   "size": 0.0225,
   "lh": 1.3,
   "color": "ink",
   "align": "left"
  },
  {
   "id": "logo",
   "label": "Logo",
   "type": "image",
   "x": 0.767,
   "y": 0.804,
   "w": 0.166,
   "h": 0.089,
   "src": "assets/img/postcard/anu-logo-line.png",
   "fit": "contain"
  }
 ],
 "quotes": [
  {
   "text": "Turning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold;\nMere anarchy is loosed upon the world,",
   "by": "WB Yeats, The Second Coming."
  }
 ],
 "pick": "random"
};
