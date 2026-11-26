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
    "lead": "Turning Point  by  Anant National University",
    "paragraphs": [
      "The act of becoming is constant negotiation, comprising many choices and decisions. Who takes the decision, and for what? \n\nEvery work begins with a set of intentions, yet true transformation happens in the friction of making—when thought is compelled to take physical form. Here, design ideas, peoples’ skills, and physical material converge, testing and blurring  distinct boundaries.\n\nTurning Point is that point where the process of conceiving  and making dissolves into being."
    ],
    "button": "Enter"
  },
  "intro": [
    "<span class='sc'>Turning Point</span> is an installation project by Anant University, created for the India Art Biennale 2026.",
    "At its core is a physical structure made of four spiraling steel columns that are held together in dynamic balance. Each 6 meter tall column rotates gradually from the base and is imbricated with patterns of emergent life-processes.",
    "The work invites you to examine the site through these perforations, pondering our relationships with the self, the other and the cosmos at large.",
    "You can <a data-go='explore'>explore</a> interactive interpretations of the site and its themes, read more about the <a data-go='structure'>structure</a> and its construction, see upcoming <a data-go='events'>events</a>, or find out about the <a data-go='credits'>team</a> that built the project."
  ],
  "socials": [
    {
      "label": "Instagram",
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
          "title": "Perforation",
          "text": "Touch the surface to seed growth. The steel is cut wherever the pattern takes hold — a small field in which to watch the life-processes on the columns emerge.",
          "href": "explorations/perforation/index.html",
          "thumb": "assets/img/explore/perforation.jpg"
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
          "text": "This sketch examines the idea of emergence through simple acts of rupture where a structure starts from a nucleus and disperses into unforeseen trajectories.",
          "href": "explorations/emergence/index.html",
          "thumb": "assets/img/explore/emergence.jpg",
          "status": "In progress"
        },
        {
          "type": "project",
          "index": "05",
          "title": "Confluence",
          "text": "This piece examines the surface of our structure. By peeling away the pattern from the steel, it turns the shell of the monument into a porous and negotiated space.",
          "href": "explorations/confluence/index.html",
          "thumb": "assets/img/explore/confluence.jpg",
          "status": "In progress"
        }
      ],
      "layout": "horizontal"
    },
    {
      "id": "structure",
      "label": "Structure",
      "heading": "STRUCTURE & PROCESS",
      "lede": "How the structure was designed, created and assembled.",
      "items": [
        {
          "type": "carousel",
          "span": 4,
          "ratio": "1800/1024",
          "slides": [
            {
              "src": "assets/img/process/render-01 copy.png",
              "alt": "Visualisation of the four spiralling cor-ten columns on site",
              "caption": "Visualisation of the structure."
            },
            {
              "src": "assets/uploads/fab-building1-2.jpg",
              "alt": "The four spiralling cor-ten columns in the workshop",
              "caption": "Fabrication of the structure."
            }
          ],
          "key": "khzarhv"
        },
        {
          "type": "text",
          "span": 1,
          "title": "Four columns in dynamic balance",
          "body": "<p>Each column is a stack of folded Cor-ten steel boxes, every layer rotated slightly from the one below so that the column turns as it rises. W</p><p>Turning point - title comes from Fritjof Capra’s 1982 book by the same name, and the installation tries to hold together the idea that life pulsates in every single thing all the time, it is for us to explore and learn its many phenomena and celebrate its complexity. The work is not a meant to be a finite resolution of such explorations but a site that opens them up to study and reflection.\n</p>",
          "key": "kpi76jz"
        },
        {
          "type": "carousel",
          "span": 3,
          "ratio": "1800/1273",
          "slides": [
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
          ],
          "key": "ku4vko6"
        },
        {
          "type": "text",
          "span": 2,
          "title": "Pattern",
          "body": "<p>The perforations are generated by a reaction–diffusion process: two simulated chemicals feeding and inhibiting one another until stripes, labyrinths and spots emerge. Living systems thrive on such Dynamic equilibrium - on carefully negotiated Homeostasis. In a world increasingly dominated by algorithmic and probabilistic logic, the installation ponders on the creation process itself, and holds dialogue as a means to strengthen thought and deepen our understanding of such relationships. \n</p>",
          "key": "k4qmry4"
        },
        {
          "type": "image",
          "span": 3,
          "ratio": "1800/1531",
          "src": "assets/img/process/pattern-study.jpg",
          "alt": "Screenshot of the pattern generator showing the full-height pattern and a density curve",
          "caption": "Pattern study — the full-height pattern and its density profile.",
          "key": "k619fbz"
        },
        {
          "type": "video",
          "span": 1,
          "ratio": "960/920",
          "src": "assets/video/growth.mp4",
          "poster": "assets/video/growth-poster.jpg",
          "caption": "Growth of the pattern (reaction–diffusion simulation).",
          "key": "koi3v2i"
        },
        {
          "type": "text",
          "span": 1,
          "title": "Fabrication",
          "body": "<p>How the layers were made.</p>",
          "key": "ks4exhw"
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
              "src": "assets/img/process/fab-corner.jpg",
              "alt": "Corner of stacked perforated steel boxes",
              "caption": "A corner of the stack."
            },
            {
              "src": "assets/img/process/fab-hall.jpg",
              "alt": "Perforated steel boxes in a fabrication hall",
              "caption": "Layers laid out in the fabrication hall."
            }
          ],
          "key": "kbjhoan"
        },
        {
          "type": "text",
          "span": 2,
          "title": "",
          "body": "<p>The four columns of the work are perforated with a pattern of Jaalis. Here the geometric repetition of the traditional Jaali is reinvented, by cross-pollinating artificial neural networks and biological neural networks. The attempt is to widen the ambit of design focus from anthropocentrism to life itself. In doing so, the work responds to the landscape that surrounds the installation as well as the monument where it is situated. As you enter the partial enclosure of the pillars you can see this incomplete negotiation between the site and the work making emergence and dialogue its fundamental pivot. \n</p>",
          "key": "kncgvxe"
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
      "heading": "The Team",
      "lede": "Turning Point was conceived, designed and built at Anant University.",
      "items": [
        {
          "type": "credits",
          "span": 3,
          "groups": [
            {
              "role": "Concept & design",
              "names": [
                "Vijay Sekhon",
                "Aditi Vashisht",
                "Dhruv Jani"
              ]
            },
            {
              "role": "Project Management",
              "names": [
                "Sangramsingh Parmar",
                "Pallavi Jain",
                "Lalit Kumar"
              ]
            },
            {
              "role": "Fabrication & Engineering",
              "names": [
                "Craft Cult Designs"
              ]
            },
            {
              "role": "Student team & Website",
              "names": [
                "Labhansh Banger",
                "Chinmaye Raju",
                "Sairam KR",
                "Sadhika Saji"
              ]
            },
            {
              "role": "Additional Credits",
              "names": [
                "Sharmila Sagra",
                "Irena Romendik",
                "Shrikant Paul",
                "Piyush Thakkar"
              ]
            },
            {
              "role": "Events Team",
              "names": [
                "Vidhu Bansal",
                "Sharmila Sagara",
                "Amruta Namjoshi"
              ]
            },
            {
              "role": "Marketing & Communication",
              "names": [
                "Apoorva Bagchi",
                "Burzeen Bhatina",
                "Juhi Hajela"
              ]
            }
          ]
        },
        {
          "type": "links",
          "span": 2,
          "title": "",
          "links": [
            {
              "label": "Instagram",
              "url": "https://www.instagram.com/anant_national_university/"
            },
            {
              "label": "Anant University",
              "url": "https://www.anu.edu.in/"
            },
            {
              "label": "India Art Biennale",
              "url": "https://indiabiennale.culture.gov.in/"
            }
          ]
        }
      ],
      "layout": "horizontal"
    }
  ],
  "texts": [
    {
      "id": "ezjiz",
      "page": "home",
      "label": "Text",
      "text": "December 4, 2026, to March 21, 2027."
    }
  ]
};
