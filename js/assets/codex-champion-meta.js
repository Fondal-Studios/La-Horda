// Authored from the character sheets in the Codex; base appearance only.
const CODEX_GAMEPLAY_ART = {
  "tanque": {
    "src": "assets/sprites/champions/tanque/codex-v1/atlas.png",
    "meta": {
      "w": 112,
      "h": 112,
      "cols": 4,
      "refH": 71,
      "anchor": 0.9464285714285714,
      "fix": {
        "left": "mirror"
      },
      "sets": {
        "idle_down": [
          0
        ],
        "walk_down": [
          0,
          1,
          2,
          3
        ],
        "attack_down": [
          12,
          13,
          14,
          15
        ],
        "idle_side": [
          4
        ],
        "walk_side": [
          4,
          5,
          6,
          7
        ],
        "attack_side": [
          16,
          17,
          18,
          19
        ],
        "idle_up": [
          8
        ],
        "walk_up": [
          8,
          9,
          10,
          11
        ],
        "attack_up": [
          20,
          21,
          22,
          23
        ],
        "cast_down": [
          24,
          25,
          26,
          27
        ],
        "hit_down": [
          28,
          29
        ],
        "hit_side": [
          30
        ],
        "hit_up": [
          31
        ],
        "death_down": [
          32,
          33,
          34,
          35
        ]
      }
    },
    "presentationHeight": 66,
    "normalization": {
      "front": [
        0.967213,
        -2
      ],
      "side": [
        0.960391,
        -2.11
      ],
      "up": [
        0.935489,
        -2.03
      ]
    }
  },
  "guerrero": {
    "src": "assets/sprites/champions/guerrero/codex-v1/atlas.png",
    "meta": {
      "w": 144,
      "h": 144,
      "cols": 4,
      "refH": 71,
      "anchor": 0.9444444444444444,
      "fix": {
        "left": "mirror"
      },
      "sets": {
        "idle_down": [
          0
        ],
        "walk_down": [
          0,
          1,
          2,
          3
        ],
        "attack_down": [
          12,
          13,
          14,
          15
        ],
        "idle_side": [
          4
        ],
        "walk_side": [
          4,
          5,
          6,
          7
        ],
        "attack_side": [
          16,
          17,
          18,
          19
        ],
        "idle_up": [
          8
        ],
        "walk_up": [
          8,
          9,
          10,
          11
        ],
        "attack_up": [
          20,
          21,
          22,
          23
        ],
        "cast_down": [
          24,
          25,
          26,
          27
        ],
        "hit_down": [
          28,
          29
        ],
        "hit_side": [
          30
        ],
        "hit_up": [
          31
        ],
        "death_down": [
          32,
          33,
          34,
          35
        ]
      }
    },
    "presentationHeight": 66,
    "normalization": {
      "front": [
        0.9516,
        -2.1
      ],
      "side": [
        0.937085,
        -2.05
      ],
      "up": [
        1.001137,
        -2.03
      ]
    }
  },
  "aelith": {
    "src": "assets/sprites/champions/aelith/codex-v1/atlas.png",
    "meta": {
      "w": 112,
      "h": 112,
      "cols": 4,
      "refH": 71,
      "anchor": 0.9464285714285714,
      "fix": {
        "left": "mirror"
      },
      "sets": {
        "idle_down": [
          0
        ],
        "walk_down": [
          0,
          1,
          2,
          3
        ],
        "attack_down": [
          12,
          13,
          14,
          15
        ],
        "idle_side": [
          4
        ],
        "walk_side": [
          4,
          5,
          6,
          7
        ],
        "attack_side": [
          16,
          17,
          18,
          19
        ],
        "idle_up": [
          8
        ],
        "walk_up": [
          8,
          9,
          10,
          11
        ],
        "attack_up": [
          20,
          21,
          22,
          23
        ],
        "cast_down": [
          24,
          25,
          26,
          27
        ],
        "hit_down": [
          28,
          29
        ],
        "hit_side": [
          30
        ],
        "hit_up": [
          31
        ],
        "death_down": [
          32,
          33,
          34,
          35
        ]
      }
    },
    "normalization": {
      "front": [
        0.939442,
        -2
      ],
      "side": [
        0.9204,
        -2
      ],
      "up": [
        0.888034,
        -2
      ]
    }
  },
  "morveth": {
    "src": "assets/sprites/champions/morveth/codex-v1/atlas.png",
    "meta": {
      "w": 112,
      "h": 112,
      "cols": 4,
      "refH": 71,
      "anchor": 0.9464285714285714,
      "fix": {
        "left": "mirror"
      },
      "sets": {
        "idle_down": [
          0
        ],
        "walk_down": [
          0,
          1,
          2,
          3
        ],
        "attack_down": [
          12,
          13,
          14,
          15
        ],
        "idle_side": [
          4
        ],
        "walk_side": [
          4,
          5,
          6,
          7
        ],
        "attack_side": [
          16,
          17,
          18,
          19
        ],
        "idle_up": [
          8
        ],
        "walk_up": [
          8,
          9,
          10,
          11
        ],
        "attack_up": [
          20,
          21,
          22,
          23
        ],
        "cast_down": [
          24,
          25,
          26,
          27
        ],
        "hit_down": [
          28,
          29
        ],
        "hit_side": [
          30
        ],
        "hit_up": [
          31
        ],
        "death_down": [
          32,
          33,
          34,
          35
        ]
      }
    },
    "normalization": {
      "front": [
        0.975759,
        -2
      ],
      "side": [
        0.958025,
        -1.89
      ],
      "up": [
        0.936009,
        -2
      ]
    }
  }
};
for(const [key,entry] of Object.entries(CODEX_GAMEPLAY_ART)){
 champPackLoadAtlas("codex_"+key,entry.src,entry.meta);
 CHAMP_PACK["codex_"+key].presentationHeight=entry.presentationHeight;
}
