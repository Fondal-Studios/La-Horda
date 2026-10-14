"use strict";
// Shared metadata; cosmetic records never modify combat.
var QUALITY_FIVE_COLLECTION = {
  "solciju": {
    "setName": "Cosecha Sitiada",
    "skinName": "Vendimiadora del Asedio",
    "arena": "ciudad",
    "theme": "Delantal blindado, arnés, cesta y hojas de bronce",
    "lore": "Cuando los muros de la bodega cedieron, Solciju puso su delantal sobre la coraza y cargó la última vendimia. La cesta conserva las hojas del primer rescate.",
    "aura": "170,145,110",
    "pieces": {
      "arma": "Sacacorchos de la Vendimia",
      "casco": "Insignia de Cosecha Sitiada",
      "pechera": "Vestidura de Cosecha Sitiada",
      "botas": "Pasos de Cosecha Sitiada"
    },
    "hue": [
      325,
      359
    ],
    "palette": [
      "#183636",
      "#285e58",
      "#56a28a",
      "#a1dbc3"
    ],
    "croma": "Añada Esmeralda"
  },
  "brakk": {
    "setName": "Cimientos del Abismo",
    "skinName": "Ingeniero del Abismo",
    "arena": "abismo",
    "theme": "Traje de presión, depósitos, mangueras y lámpara de jaula",
    "lore": "Brakk descendió con cuatro piezas que había probado en tierra firme. Bajo la roca aprendió que un refugio también necesita aire. Su arnés conserva las marcas de aquel rescate.",
    "aura": "170,145,110",
    "pieces": {
      "arma": "Maza de Presión",
      "casco": "Insignia de Cimientos del Abismo",
      "pechera": "Vestidura de Cimientos del Abismo",
      "botas": "Pasos de Cimientos del Abismo"
    },
    "hue": [
      15,
      65
    ],
    "palette": [
      "#242c49",
      "#434e7a",
      "#7e8fbd",
      "#ccd8e9"
    ],
    "croma": "Acero de Tormenta"
  },
  "veyra": {
    "setName": "Cicatriz de Obsidiana",
    "skinName": "Cicatriz de Obsidiana",
    "arena": "infernal",
    "theme": "Placas de vidrio negro, hombrera angular y sable de obsidiana",
    "lore": "Veyra recogió los fragmentos de una puerta que no pudo atravesar. Los convirtió en placas, dejando visible cada cicatriz. Su armadura recuerda por qué vuelve a levantarse.",
    "aura": "170,145,110",
    "pieces": {
      "arma": "Sable de la Cicatriz",
      "casco": "Insignia de Cicatriz de Obsidiana",
      "pechera": "Vestidura de Cicatriz de Obsidiana",
      "botas": "Pasos de Cicatriz de Obsidiana"
    },
    "hue": [
      335,
      8
    ],
    "palette": [
      "#25233d",
      "#51447b",
      "#8d73b0",
      "#d9b8df"
    ],
    "croma": "Herida Amatista"
  },
  "morveth": {
    "setName": "Huerto de Sal",
    "skinName": "Huerto de Sal",
    "arena": "minas",
    "theme": "Hongos de sal rosada, placas cristalinas y raíces blanqueadas",
    "lore": "En las galerías secas, Morveth encontró una sal que conservaba semillas dormidas. La dejó crecer sobre sus raíces. Ahora su huerto florece donde la piedra parecía estéril.",
    "aura": "170,145,110",
    "pieces": {
      "arma": "Hoz de Sal Dormida",
      "casco": "Insignia de Huerto de Sal",
      "pechera": "Vestidura de Huerto de Sal",
      "botas": "Pasos de Huerto de Sal"
    },
    "hue": [
      20,
      80
    ],
    "palette": [
      "#243d35",
      "#3e6855",
      "#77a17d",
      "#c4d2a1"
    ],
    "croma": "Musgo del Retorno"
  },
  "aelith": {
    "setName": "Hora del Mediodía",
    "skinName": "Custodia del Mediodía",
    "arena": "laberinto",
    "theme": "Armadura solar, faldón segmentado, manto rojo y reloj radiado",
    "lore": "Aelith vistió las piezas que marcaban el mediodía en un observatorio sin sombra. El reloj siguió roto. Aprendió a conservar la hora sin fingir que podía reparar todo lo perdido.",
    "aura": "170,145,110",
    "pieces": {
      "arma": "Reloj del Mediodía",
      "casco": "Insignia de Hora del Mediodía",
      "pechera": "Vestidura de Hora del Mediodía",
      "botas": "Pasos de Hora del Mediodía"
    },
    "hue": [
      150,
      225
    ],
    "palette": [
      "#482336",
      "#79405a",
      "#b96b82",
      "#e8b4b3"
    ],
    "croma": "Segundo Carmesí"
  }
};
champPackLoadAtlas("skin_quality_solciju","assets/sprites/champions/solciju/skins/quality_solciju/atlas.png",{"w": 112, "h": 112, "cols": 4, "refH": 70, "anchor": 0.9464285714285714, "fix": {"left": "mirror"}, "sets": {"idle_down": [0], "walk_down": [0, 1, 2, 3], "attack_down": [12, 13, 14, 15], "cast_down": [24, 25, 26, 27], "ultimate_down": [28, 29, 30, 31], "hit_down": [12], "death_down": [32, 33, 34, 35], "idle_side": [4], "walk_side": [4, 5, 6, 7], "attack_side": [16, 17, 18, 19], "cast_side": [24, 25, 26, 27], "ultimate_side": [28, 29, 30, 31], "hit_side": [16], "death_side": [32, 33, 34, 35], "idle_up": [8], "walk_up": [8, 9, 10, 11], "attack_up": [20, 21, 22, 23], "cast_up": [24, 25, 26, 27], "ultimate_up": [28, 29, 30, 31], "hit_up": [20], "death_up": [32, 33, 34, 35]}});
SET_SKINS["quality_solciju"]={"champ": "solciju", "name": "Vendimiadora del Asedio", "lore": "Cuando los muros de la bodega cedieron, Solciju puso su delantal sobre la coraza y cargó la última vendimia. La cesta conserva las hojas del primer rescate.", "src": "assets/sprites/champions/solciju/skins/quality_solciju/preview.png", "preview": "assets/sprites/champions/solciju/skins/quality_solciju/preview.png", "packs": {"solciju": "skin_quality_solciju"}, "preserveAuthoredArt": true, "visualTheme": "Delantal blindado, arnés, cesta y hojas de bronce", "rarity": "Set", "collection": "Los Cinco Nuevos", "unlockSource": "Completar Cosecha Sitiada en ciudad", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
CROMA_SKINS["solciju_croma"]={"champ": "solciju", "name": "Añada Esmeralda", "price": 1500, "crystal": "cinco", "appearanceType": "croma", "rarity": "Rara", "tagline": "Una paleta alternativa para Solciju.", "lore": "Los colores de Añada Esmeralda acompañan un nuevo viaje. Conserva su vestuario y sus decisiones: esta apariencia cambia únicamente la paleta.", "visualTheme": "Paleta selectiva; conserva piel y contorno.", "collection": "Los Cinco Nuevos", "preserveAuthoredArt": true, "preview": "assets/sprites/champions/solciju/croma-preview.png", "files": {}, "exPalette": {"colors": ["#183636", "#285e58", "#56a28a", "#a1dbc3"], "tint": "#56a28a", "hueRange": [325, 359]}, "unlockSource": "Oro del juego", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
champPackLoadAtlas("skin_quality_brakk","assets/sprites/champions/brakk/skins/quality_brakk/atlas.png",{"w": 112, "h": 112, "cols": 4, "refH": 70, "anchor": 0.9464285714285714, "fix": {"left": "mirror"}, "sets": {"idle_down": [0], "walk_down": [0, 1, 2, 3], "attack_down": [12, 13, 14, 15], "cast_down": [24, 25, 26, 27], "ultimate_down": [28, 29, 30, 31], "hit_down": [12], "death_down": [32, 33, 34, 35], "idle_side": [4], "walk_side": [4, 5, 6, 7], "attack_side": [16, 17, 18, 16], "cast_side": [24, 25, 26, 27], "ultimate_side": [28, 29, 30, 31], "hit_side": [16], "death_side": [32, 33, 34, 35], "idle_up": [8], "walk_up": [8, 9, 10, 11], "attack_up": [20, 21, 22, 23], "cast_up": [24, 25, 26, 27], "ultimate_up": [28, 29, 30, 31], "hit_up": [19], "death_up": [32, 33, 34, 35]}});
SET_SKINS["quality_brakk"]={"champ": "brakk", "name": "Ingeniero del Abismo", "lore": "Brakk descendió con cuatro piezas que había probado en tierra firme. Bajo la roca aprendió que un refugio también necesita aire. Su arnés conserva las marcas de aquel rescate.", "src": "assets/sprites/champions/brakk/skins/quality_brakk/preview.png", "preview": "assets/sprites/champions/brakk/skins/quality_brakk/preview.png", "packs": {"brakk": "skin_quality_brakk"}, "preserveAuthoredArt": true, "visualTheme": "Traje de presión, depósitos, mangueras y lámpara de jaula", "rarity": "Set", "collection": "Los Cinco Nuevos", "unlockSource": "Completar Cimientos del Abismo en abismo", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
CROMA_SKINS["brakk_croma"]={"champ": "brakk", "name": "Acero de Tormenta", "price": 1500, "crystal": "cinco", "appearanceType": "croma", "rarity": "Rara", "tagline": "Una paleta alternativa para Brakk.", "lore": "Los colores de Acero de Tormenta acompañan un nuevo viaje. Conserva su vestuario y sus decisiones: esta apariencia cambia únicamente la paleta.", "visualTheme": "Paleta selectiva; conserva piel y contorno.", "collection": "Los Cinco Nuevos", "preserveAuthoredArt": true, "preview": "assets/sprites/champions/brakk/croma-preview.png", "files": {}, "exPalette": {"colors": ["#242c49", "#434e7a", "#7e8fbd", "#ccd8e9"], "tint": "#7e8fbd", "hueRange": [15, 65]}, "unlockSource": "Oro del juego", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
champPackLoadAtlas("skin_quality_veyra","assets/sprites/champions/veyra/skins/quality_veyra/atlas.png",{"w": 112, "h": 112, "cols": 4, "refH": 70, "anchor": 0.9464285714285714, "fix": {"left": "mirror"}, "sets": {"idle_down": [0], "walk_down": [0, 1, 2, 3], "attack_down": [12, 13, 14, 15], "cast_down": [24, 25, 26, 27], "ultimate_down": [28, 29, 30, 31], "hit_down": [12], "death_down": [32, 33, 34, 35], "idle_side": [4], "walk_side": [4, 5, 6, 7], "attack_side": [16, 17, 18, 19], "cast_side": [24, 25, 26, 27], "ultimate_side": [28, 29, 30, 31], "hit_side": [16], "death_side": [32, 33, 34, 35], "idle_up": [8], "walk_up": [8, 9, 10, 11], "attack_up": [20, 21, 22, 23], "cast_up": [24, 25, 26, 27], "ultimate_up": [28, 29, 30, 31], "hit_up": [20], "death_up": [32, 33, 34, 35]}});
SET_SKINS["quality_veyra"]={"champ": "veyra", "name": "Cicatriz de Obsidiana", "lore": "Veyra recogió los fragmentos de una puerta que no pudo atravesar. Los convirtió en placas, dejando visible cada cicatriz. Su armadura recuerda por qué vuelve a levantarse.", "src": "assets/sprites/champions/veyra/skins/quality_veyra/preview.png", "preview": "assets/sprites/champions/veyra/skins/quality_veyra/preview.png", "packs": {"veyra": "skin_quality_veyra"}, "preserveAuthoredArt": true, "visualTheme": "Placas de vidrio negro, hombrera angular y sable de obsidiana", "rarity": "Set", "collection": "Los Cinco Nuevos", "unlockSource": "Completar Cicatriz de Obsidiana en infernal", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
CROMA_SKINS["veyra_croma"]={"champ": "veyra", "name": "Herida Amatista", "price": 1500, "crystal": "cinco", "appearanceType": "croma", "rarity": "Rara", "tagline": "Una paleta alternativa para Veyra.", "lore": "Los colores de Herida Amatista acompañan un nuevo viaje. Conserva su vestuario y sus decisiones: esta apariencia cambia únicamente la paleta.", "visualTheme": "Paleta selectiva; conserva piel y contorno.", "collection": "Los Cinco Nuevos", "preserveAuthoredArt": true, "preview": "assets/sprites/champions/veyra/croma-preview.png", "files": {}, "exPalette": {"colors": ["#25233d", "#51447b", "#8d73b0", "#d9b8df"], "tint": "#8d73b0", "hueRange": [335, 8]}, "unlockSource": "Oro del juego", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
champPackLoadAtlas("skin_quality_morveth","assets/sprites/champions/morveth/skins/quality_morveth/atlas.png",{"w": 112, "h": 112, "cols": 4, "refH": 70, "anchor": 0.9464285714285714, "fix": {"left": "mirror"}, "sets": {"idle_down": [0], "walk_down": [0, 1, 2, 3], "attack_down": [12, 13, 14, 15], "cast_down": [24, 25, 26, 27], "ultimate_down": [28, 29, 30, 31], "hit_down": [12], "death_down": [32, 33, 34, 35], "idle_side": [4], "walk_side": [4, 5, 6, 7], "attack_side": [16, 17, 18, 19], "cast_side": [24, 25, 26, 27], "ultimate_side": [28, 29, 30, 31], "hit_side": [16], "death_side": [32, 33, 34, 35], "idle_up": [8], "walk_up": [8, 9, 10, 11], "attack_up": [20, 21, 22, 23], "cast_up": [24, 25, 26, 27], "ultimate_up": [28, 29, 30, 31], "hit_up": [20], "death_up": [32, 33, 34, 35]}});
SET_SKINS["quality_morveth"]={"champ": "morveth", "name": "Huerto de Sal", "lore": "En las galerías secas, Morveth encontró una sal que conservaba semillas dormidas. La dejó crecer sobre sus raíces. Ahora su huerto florece donde la piedra parecía estéril.", "src": "assets/sprites/champions/morveth/skins/quality_morveth/preview.png", "preview": "assets/sprites/champions/morveth/skins/quality_morveth/preview.png", "packs": {"morveth": "skin_quality_morveth"}, "preserveAuthoredArt": true, "visualTheme": "Hongos de sal rosada, placas cristalinas y raíces blanqueadas", "rarity": "Set", "collection": "Los Cinco Nuevos", "unlockSource": "Completar Huerto de Sal en minas", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
CROMA_SKINS["morveth_croma"]={"champ": "morveth", "name": "Musgo del Retorno", "price": 1500, "crystal": "cinco", "appearanceType": "croma", "rarity": "Rara", "tagline": "Una paleta alternativa para Morveth.", "lore": "Los colores de Musgo del Retorno acompañan un nuevo viaje. Conserva su vestuario y sus decisiones: esta apariencia cambia únicamente la paleta.", "visualTheme": "Paleta selectiva; conserva piel y contorno.", "collection": "Los Cinco Nuevos", "preserveAuthoredArt": true, "preview": "assets/sprites/champions/morveth/croma-preview.png", "files": {}, "exPalette": {"colors": ["#243d35", "#3e6855", "#77a17d", "#c4d2a1"], "tint": "#77a17d", "hueRange": [20, 80]}, "unlockSource": "Oro del juego", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
champPackLoadAtlas("skin_quality_aelith","assets/sprites/champions/aelith/skins/quality_aelith/atlas.png",{"w": 112, "h": 112, "cols": 4, "refH": 70, "anchor": 0.9464285714285714, "fix": {"left": "mirror"}, "sets": {"idle_down": [0], "walk_down": [0, 1, 2, 3], "attack_down": [12, 13, 14, 15], "cast_down": [24, 25, 26, 27], "ultimate_down": [28, 29, 30, 31], "hit_down": [12], "death_down": [32, 33, 34, 35], "idle_side": [4], "walk_side": [4, 5, 6, 7], "attack_side": [16, 17, 18, 19], "cast_side": [24, 25, 26, 27], "ultimate_side": [28, 29, 30, 31], "hit_side": [16], "death_side": [32, 33, 34, 35], "idle_up": [8], "walk_up": [8, 9, 10, 11], "attack_up": [20, 21, 22, 23], "cast_up": [24, 25, 26, 27], "ultimate_up": [28, 29, 30, 31], "hit_up": [20], "death_up": [32, 33, 34, 35]}});
SET_SKINS["quality_aelith"]={"champ": "aelith", "name": "Custodia del Mediodía", "lore": "Aelith vistió las piezas que marcaban el mediodía en un observatorio sin sombra. El reloj siguió roto. Aprendió a conservar la hora sin fingir que podía reparar todo lo perdido.", "src": "assets/sprites/champions/aelith/skins/quality_aelith/preview.png", "preview": "assets/sprites/champions/aelith/skins/quality_aelith/preview.png", "packs": {"aelith": "skin_quality_aelith"}, "preserveAuthoredArt": true, "visualTheme": "Armadura solar, faldón segmentado, manto rojo y reloj radiado", "rarity": "Set", "collection": "Los Cinco Nuevos", "unlockSource": "Completar Hora del Mediodía en laberinto", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
CROMA_SKINS["aelith_croma"]={"champ": "aelith", "name": "Segundo Carmesí", "price": 1500, "crystal": "cinco", "appearanceType": "croma", "rarity": "Rara", "tagline": "Una paleta alternativa para Aelith.", "lore": "Los colores de Segundo Carmesí acompañan un nuevo viaje. Conserva su vestuario y sus decisiones: esta apariencia cambia únicamente la paleta.", "visualTheme": "Paleta selectiva; conserva piel y contorno.", "collection": "Los Cinco Nuevos", "preserveAuthoredArt": true, "preview": "assets/sprites/champions/aelith/croma-preview.png", "files": {}, "exPalette": {"colors": ["#482336", "#79405a", "#b96b82", "#e8b4b3"], "tint": "#b96b82", "hueRange": [150, 225]}, "unlockSource": "Oro del juego", "vfxProfile": "original", "sfxProfile": "original", "availability": "alpha-test", "premiumPrice": null};
