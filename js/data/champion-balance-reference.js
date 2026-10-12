"use strict";
// Generated from docs/balance/champion-entry-reference.json; do not drift from that file.
const CHAMPION_BALANCE_REFERENCE = {
  "version": 4,
  "date": "2026-10-12",
  "knownChampions": [
    "tanque",
    "guerrero",
    "mago",
    "soporte",
    "segador",
    "axiom",
    "profeta",
    "musashi",
    "cazadora",
    "nigromante",
    "libertador",
    "eren",
    "myla",
    "brasa",
    "eslabon",
    "morwen",
    "farolero",
    "iria",
    "ostrel",
    "grelk",
    "ilsa",
    "vorn",
    "nerith",
    "quillon",
    "kora"
  ],
  "roles": {
    "asesino": {
      "hp": {
        "mean": 109.428571,
        "min": 77.4,
        "max": 140.8
      },
      "damage": {
        "mean": 12.857143,
        "min": 8.1,
        "max": 26.4
      },
      "defense": {
        "mean": 0.077143,
        "min": 0.045,
        "max": 0.11
      },
      "speed": {
        "mean": 174.857143,
        "min": 144.0,
        "max": 203.5
      },
      "basicDPS": {
        "mean": 26.855705,
        "min": 14.896552,
        "max": 46.538462
      },
      "effectiveHP": {
        "mean": 118.846522,
        "min": 81.473684,
        "max": 153.043478
      },
      "hpGrowth": {
        "mean": 0.871429,
        "min": 0.585,
        "max": 1.155
      },
      "damageGrowth": {
        "mean": 1.135714,
        "min": 0.9,
        "max": 1.485
      },
      "simulation": {
        "meanDamage150s": 11217.845,
        "meanTeamKills150s": 496.533,
        "samples": 21
      }
    },
    "mago": {
      "hp": {
        "mean": 98.222222,
        "min": 82.8,
        "max": 118.8
      },
      "damage": {
        "mean": 10.111111,
        "min": 7.2,
        "max": 14.3
      },
      "defense": {
        "mean": 0.07,
        "min": 0.045,
        "max": 0.099
      },
      "speed": {
        "mean": 157.777778,
        "min": 135.0,
        "max": 180.4
      },
      "basicDPS": {
        "mean": 18.527261,
        "min": 12.857143,
        "max": 26.481481
      },
      "effectiveHP": {
        "mean": 105.676595,
        "min": 87.157895,
        "max": 130.549451
      },
      "hpGrowth": {
        "mean": 0.774444,
        "min": 0.558,
        "max": 0.88
      },
      "damageGrowth": {
        "mean": 1.174444,
        "min": 0.9,
        "max": 1.672
      },
      "simulation": {
        "meanDamage150s": 13912.899,
        "meanTeamKills150s": 500.524,
        "samples": 27
      }
    },
    "soporte": {
      "hp": {
        "mean": 113.75,
        "min": 94.5,
        "max": 136.4
      },
      "damage": {
        "mean": 7.625,
        "min": 6.3,
        "max": 8.8
      },
      "defense": {
        "mean": 0.13,
        "min": 0.108,
        "max": 0.154
      },
      "speed": {
        "mean": 165.0,
        "min": 145.8,
        "max": 184.8
      },
      "basicDPS": {
        "mean": 13.277651,
        "min": 10.5,
        "max": 16.923077
      },
      "effectiveHP": {
        "mean": 130.785172,
        "min": 107.386364,
        "max": 156.781609
      },
      "hpGrowth": {
        "mean": 1.1625,
        "min": 1.035,
        "max": 1.32
      },
      "damageGrowth": {
        "mean": 0.7625,
        "min": 0.63,
        "max": 0.88
      },
      "simulation": {
        "meanDamage150s": 6832.013,
        "meanTeamKills150s": 500.556,
        "samples": 12
      }
    },
    "tanque": {
      "hp": {
        "mean": 168.8,
        "min": 135.0,
        "max": 211.2
      },
      "damage": {
        "mean": 9.6,
        "min": 8.1,
        "max": 13.2
      },
      "defense": {
        "mean": 0.2,
        "min": 0.162,
        "max": 0.242
      },
      "speed": {
        "mean": 143.6,
        "min": 124.2,
        "max": 165.0
      },
      "basicDPS": {
        "mean": 15.004187,
        "min": 12.461538,
        "max": 20.625
      },
      "effectiveHP": {
        "mean": 211.316135,
        "min": 164.634146,
        "max": 270.769231
      },
      "hpGrowth": {
        "mean": 1.4,
        "min": 1.215,
        "max": 1.595
      },
      "damageGrowth": {
        "mean": 0.8,
        "min": 0.675,
        "max": 0.935
      },
      "simulation": {
        "meanDamage150s": 8419.815,
        "meanTeamKills150s": 492.556,
        "samples": 15
      }
    }
  },
  "compositeWeights": {
    "effectiveHP": 0.4,
    "basicDPS": 0.45,
    "speed": 0.15
  },
  "compositeCeiling": 1.15,
  "profiles": {
    "founder": {
      "categories": [
        "FOUNDER"
      ],
      "statMultiplier": 1.35,
      "compositeCeiling": 1.6,
      "simulationCeilingMultiplier": 2.6,
      "rationale": "Regentes Fundadores: deliberadamente por encima de STANDARD pero acotados (sin valores infinitos). Mismo normalizador y misma simulación; solo cambia el techo, explícito y versionado."
    },
    "ascension": {
      "categories": [
        "ASCENSION"
      ],
      "statMultiplier": 1.1,
      "compositeCeiling": 1.25,
      "simulationCeilingMultiplier": 1.5,
      "rationale": "Ascensión: campeones especiales que se ganan con logros o se compran por 9000 de oro. Pedido del dueño: levemente más fuertes que STANDARD. Mismo normalizador y misma simulación; el techo sube de 1,35 a 1,5 veces la media del rol, explícito y versionado."
    }
  }
};
