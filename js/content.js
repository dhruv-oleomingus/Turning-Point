/* =====================================================================
   TURNING POINT — site content
   Edited with admin/index.html — or by hand: it is plain JavaScript.
   Box types: text, image, carousel, video, embed, project, event, credits, links
   (see README.md). Paths are relative to index.html.
   ===================================================================== */

window.SITE = {
  "title": "Turning Point",
  "meta": "",
  "preface": {
    "lead": "",
    "paragraphs": [
      "The act of becoming is constant negotiation, filled with many choices and decisions. Who takes the decision and for what?\n\nEvery work begins with a set of intentions, yet true transformation happens in the friction of making—when thought is forced to take physical form. Here, design, people, and material converge to test and blur their own boundaries.\n\nTurning Point is that point where the process of deciding and making dissolves into being.",
      "Through trust, materiality, and shared inquiry, learning becomes a living negotiation. Here, process and meaning merge, inviting us to witness how we shape the world as it shapes us."
    ],
    "button": "Enter"
  },
  "intro": [
    "<span class='sc'>Turning Point</span> is an installation project by Anant University, created for the Delhi Art Biennale 2026.",
    "At its core is a physical structure made of four spiraling steel columns that are held together in dynamic balance. Each 6 meter tall column rotates gradually from the base and is imbricated with patterns of emergent life-processes.",
    "The work invites you to examine the site through these perforations, pondering our relationships with the self, the other and the cosmos at large.",
    "You can <a data-go='explore'>explore</a> interactive interpretations of the site and its themes, read more about the <a data-go='structure'>structure</a> and its construction, see upcoming <a data-go='events'>events</a>, or find out about the <a data-go='credits'>team</a> that built the project."
  ],
  "socials": [
    {
      "label": "Instagram",
      "url": "#"
    },
    {
      "label": "YouTube",
      "url": "#"
    }
  ],
  "sections": [
    {
      "id": "explore",
      "label": "Explore",
      "heading": "INTERACTIVE INTERPRETATIONS",
      "lede": "A series of interactive explorations of the site and its themes. Each opens on its own page.",
      "items": [
        {
          "type": "project",
          "index": "01",
          "title": "Confluence",
          "text": "Placeholder — a short description of Confluence: its question, and what the visitor does.",
          "href": "explorations/confluence/index.html",
          "thumb": "assets/img/explore/confluence.jpg",
          "status": "In progress"
        },
        {
          "type": "project",
          "index": "02",
          "title": "Metamorphosis",
          "text": "Scroll to turn the column like a screw. After two turns it locks, and the pattern grows off its arms until it fills the screen — then the view pulls back to find the same pattern on a coral, a fish, a termite mound, and returns to the column.",
          "href": "explorations/metamorphosis/index.html",
          "thumb": "assets/img/explore/metamorphosis.jpg",
          "status": "Prototype"
        },
        {
          "type": "project",
          "index": "03",
          "title": "Flux",
          "text": "Placeholder — a short description of Flux: its question, and what the visitor does.",
          "href": "explorations/flux/index.html",
          "thumb": "assets/img/explore/flux.jpg",
          "status": "In progress"
        },
        {
          "type": "project",
          "index": "04",
          "title": "Emergence",
          "text": "Placeholder — a short description of Emergence: its question, and what the visitor does.",
          "href": "explorations/emergence/index.html",
          "thumb": "assets/img/explore/emergence.jpg",
          "status": "In progress"
        },
        {
          "type": "project",
          "index": "05",
          "title": "Perforation",
          "text": "Touch the surface to seed growth. The steel is cut wherever the pattern takes hold — a small field in which to watch the life-processes on the columns emerge.",
          "href": "explorations/perforation/index.html",
          "thumb": "assets/img/explore/perforation.jpg"
        }
      ],
      "layout": "horizontal"
    },
    {
      "id": "structure",
      "label": "Structure",
      "heading": "STRUCTURE & PROCESS",
      "lede": "How the structure was designed, created and assembled.",
      "layout": "feature",
      "items": [
        {
          "type": "image",
          "span": 4,
          "ratio": "1800/1273",
          "src": "assets/img/process/render-01 copy.png",
          "alt": "Visualisation of the four spiralling cor-ten columns on site",
          "caption": "Visualisation of the structure."
        },
        {
          "type": "text",
          "span": 1,
          "title": "Four columns in dynamic balance",
          "body": "<p>Each column is a stack of folded Cor-ten steel boxes, every layer rotated slightly from the one below so that the column turns as it rises. W</p><p>Turning point - title comes from Fritjof Capra’s 1982 book by the same name. The installation underpins the idea that life pulsates in every single thing all the time, it is for us to explore and learn its many phenomena and celebrate its complexity. The installation’s materiality of Cor-Ten Steel responding to the forces of elemental world resists decay from inside but changes and responds on the outside. The work is not a resolution of these ideas but opens them up to study and reflection. In the tradition of the universities as a place of learning, the installation engages with complex ideas to better understand cross-pollination, collaboration and attempting to create the new without abandoning our past. \n</p>"
        },
        {
          "type": "carousel",
          "span": 3,
          "ratio": "1800/1273",
          "slides": [
            {
              "src": "assets/img/process/render-02.jpg",
              "alt": "Visualisation of the columns in evening light",
              "caption": "Visualisation, evening light."
            },
            {
              "src": "assets/img/process/render-05.jpg",
              "alt": "Visualisation of the columns with a human figure for scale",
              "caption": "Visualisation with a figure for scale."
            },
            {
              "src": "assets/img/process/render-03.jpg",
              "alt": "Visualisation looking up between the perforated columns",
              "caption": "Between the columns, looking up."
            },
            {
              "src": "assets/img/process/render-04.jpg",
              "alt": "Visualisation of the columns from another side",
              "caption": "Visualisation, second view."
            }
          ]
        },
        {
          "type": "text",
          "span": 2,
          "title": "Pattern",
          "body": "<p>The perforations are generated by a reaction–diffusion process: two simulated chemicals feeding and inhibiting one another until stripes, labyrinths and spots emerge. Denser tendrils at the top give way to more solid steel towards the base. Living systems thrive on Dynamic equilibrium - Homeostasis, and are never absolute. This raises inquiries into our relationship with self, other and cosmos at large. In a world increasingly dominated by algorithmic and probabilistic logic, the installation ponders on the creation process itself, and holds dialogue as a means to strengthen thought and deepen our understanding of our relationships. \n</p>"
        },
        {
          "type": "image",
          "span": 3,
          "ratio": "1800/1531",
          "src": "assets/img/process/pattern-study.jpg",
          "alt": "Screenshot of the pattern generator showing the full-height pattern and a density curve",
          "caption": "Pattern study — the full-height pattern and its density profile."
        },
        {
          "type": "video",
          "span": 1,
          "ratio": "960/920",
          "src": "assets/video/growth.mp4",
          "poster": "assets/video/growth-poster.jpg",
          "caption": "Growth of the pattern (reaction–diffusion simulation)."
        },
        {
          "type": "text",
          "span": 1,
          "title": "Fabrication",
          "body": "<p>Placeholder. How the layers were made — cutting, welding — and who made them.</p>"
        },
        {
          "type": "carousel",
          "span": 3,
          "ratio": "1800/1273",
          "slides": [
            {
              "src": "assets/img/process/fab-welding.jpg",
              "alt": "A welder working on a perforated steel box",
              "caption": "Welding a folded layer."
            },
            {
              "src": "assets/img/process/fab-stack.jpg",
              "alt": "Stacked perforated steel boxes",
              "caption": "Finished layers, stacked."
            },
            {
              "src": "assets/img/process/fab-plate-detail.jpg",
              "alt": "Close-up of a laser-cut perforated plate",
              "caption": "A cut plate, before weathering settles."
            },
            {
              "src": "assets/img/process/fab-workshop-01.jpg",
              "alt": "Perforated steel layers stacked in a workshop",
              "caption": "Layers in the workshop."
            },
            {
              "src": "assets/img/process/fab-box-interior.jpg",
              "alt": "Interior of a perforated steel box",
              "caption": "Inside a layer: the patterned faces from within."
            },
            {
              "src": "assets/img/process/fab-layers.jpg",
              "alt": "Close-up of several stacked perforated layers",
              "caption": "Patterns across successive layers."
            },
            {
              "src": "assets/img/process/fab-workshop-02.jpg",
              "alt": "Two people inspecting stacked perforated layers in a workshop",
              "caption": "Checking the stack in the workshop."
            },
            {
              "src": "assets/img/process/fab-corner.jpg",
              "alt": "Corner of stacked perforated steel boxes",
              "caption": "A corner of the stack."
            },
            {
              "src": "assets/img/process/fab-hall.jpg",
              "alt": "Perforated steel boxes in a fabrication hall",
              "caption": "Layers laid out in the fabrication hall."
            }
          ]
        },
        {
          "type": "text",
          "span": 2,
          "title": "",
          "body": "<p>The four columns of the work are perforated with a pattern of Jaalis. Here the geometric repetition of the traditional Jaali is reinvented, by cross-pollinating artificial neural networks and biological neural networks. The attempt is a formal exploration of morphic resonance and interspecies level interconnectivity - widening the ambit of design focus from anthropocentrism to life itself.\nIn doing so, the work responds to the landscape that surrounds the installation as well as the monument where it is situated. As you enter the partial enclosure of the pillars you can see this incomplete negotiation between the site and the work making emergence and dialogue as its fundamental pivot. \n</p>"
        },
        {
          "type": "image",
          "span": 2,
          "ratio": "1800/1273",
          "src": "assets/img/process/fab-weathering.jpg",
          "alt": "Close-up of a rusting steel surface",
          "caption": "The surface."
        }
      ]
    },
    {
      "id": "events",
      "label": "Events",
      "heading": "UPCOMING EVENTS",
      "comingSoon": true,
      "lede": "Walk-throughs, Performances and Readings at the installation during the Biennale.",
      "items": [
        {
          "type": "event",
          "span": 4,
          "date": "2026-12-12",
          "time": "17:00",
          "title": "Event title (placeholder)",
          "place": "Venue, New Delhi",
          "text": "Placeholder. A short description of the event — who is speaking, what happens, whether registration is needed.",
          "link": "#",
          "linkLabel": "Details"
        },
        {
          "type": "event",
          "span": 4,
          "date": "2026-12-19",
          "time": "11:00",
          "title": "Event title (placeholder)",
          "place": "Venue, New Delhi",
          "text": "Placeholder. A workshop or a walk-through with the team that built the columns.",
          "link": "#",
          "linkLabel": "Register"
        },
        {
          "type": "event",
          "span": 4,
          "date": "2027-01-09",
          "time": "16:00",
          "title": "Event title (placeholder)",
          "place": "Venue, New Delhi",
          "text": "Placeholder.",
          "link": "",
          "linkLabel": ""
        }
      ]
    },
    {
      "id": "credits",
      "label": "Credits",
      "heading": "THE TEAM",
      "lede": "Turning Point was conceived, designed and built at Anant University.",
      "items": [
        {
          "type": "credits",
          "span": 3,
          "groups": [
            {
              "role": "Concept & design",
              "names": [
                "Name Surname",
                "Name Surname",
                "Name Surname",
                "Name Surname"
              ]
            },
            {
              "role": "Pattern & computation",
              "names": [
                "Name Surname",
                "Name Surname",
                "Name Surname"
              ]
            },
            {
              "role": "Structure & engineering",
              "names": [
                "Name Surname",
                "Name Surname",
                "Name Surname"
              ]
            },
            {
              "role": "Fabrication",
              "names": [
                "Name Surname",
                "Name Surname"
              ]
            },
            {
              "role": "Student team",
              "names": [
                "Name Surname",
                "Name Surname",
                "Name Surname",
                "Name Surname"
              ]
            },
            {
              "role": "Website",
              "names": [
                "Name Surname",
                "Name Surname"
              ]
            }
          ]
        },
        {
          "type": "links",
          "span": 1,
          "title": "Follow",
          "links": [
            {
              "label": "Instagram",
              "url": "#"
            },
            {
              "label": "YouTube",
              "url": "#"
            },
            {
              "label": "Anant University",
              "url": "#"
            },
            {
              "label": "Delhi Art Biennale",
              "url": "#"
            }
          ]
        }
      ]
    }
  ]
};
