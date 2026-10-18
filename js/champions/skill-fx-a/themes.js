'use strict';
/* js/champions/skill-fx-a/themes.js — paleta, silueta del frente y motivos de cada campeón (mitad A del roster).
   Paletas de 5-6 colores con contorno, sacadas del color/brillo de la clase (CLASSES[k].color / .glow), para que el efecto
   se lea como de ese campeón aun sin leer el nombre. La forma (shape) cambia la silueta del frente, no el área: el borde
   exterior punteado siempre es el radio real de la habilidad. */
sfaDefineTheme('time',    {pal: {o: '#1e1633', d: '#5a4a8c', a: '#a58fd6', b: '#d9c9f5', c: '#fff8e0', e: '#f0c070'}, shape: 'sun',     motifs: ['tick', 'sand', 'gear', 'spark'],   emblem: 'clock',   nMotif: 12});
sfaDefineTheme('prism',   {pal: {o: '#3a2400', d: '#a86a12', a: '#f2c14e', b: '#ffe69a', c: '#fffbe8', e: '#ffffff'}, shape: 'hex',     motifs: ['prism', 'diamond', 'ray', 'spark'], emblem: 'star'});
sfaDefineTheme('glitch',  {pal: {o: '#06161a', d: '#1f6e75', a: '#3ad6c4', b: '#9df5ea', c: '#ffffff', e: '#ff4fd8'}, shape: 'glitch',  motifs: ['block', 'glitch', 'block', 'spark'], emblem: 'glitch'});
sfaDefineTheme('bell',    {pal: {o: '#0f2326', d: '#3d6d73', a: '#8bb4bd', b: '#cfeef0', c: '#ffffff', e: '#d9a24a'}, shape: 'scallop', motifs: ['bell', 'ring', 'drop', 'wave'],     emblem: 'bell'});
sfaDefineTheme('siege',   {pal: {o: '#1b140c', d: '#6d5636', a: '#cead7a', b: '#f0dcae', c: '#fff6dc', e: '#ff8a3c'}, shape: 'square',  motifs: ['nail', 'brick', 'bolt', 'rivet'],   emblem: 'plate'});
sfaDefineTheme('steam',   {pal: {o: '#2a1608', d: '#8a5426', a: '#c58543', b: '#ffd28a', c: '#fff4dc', e: '#ffffff'}, shape: 'gear',    motifs: ['gear', 'steam', 'rivet', 'spark'],  emblem: 'gear'});
sfaDefineTheme('crystal', {pal: {o: '#101c26', d: '#44627a', a: '#8aa4b8', b: '#bfe8ff', c: '#ffffff', e: '#5fd0ff'}, shape: 'hex',     motifs: ['shard', 'plate', 'ice', 'diamond'], emblem: 'shard'});
sfaDefineTheme('hunt',    {pal: {o: '#12220c', d: '#2f5a24', a: '#5c9a4a', b: '#c8f0a8', c: '#f4ffe0', e: '#d8b050'}, shape: 'petal',   motifs: ['leaf', 'arrow', 'thorn', 'spark'],  emblem: 'leaf'});
sfaDefineTheme('music',   {pal: {o: '#2a1a08', d: '#8a6a34', a: '#d6af77', b: '#f6dba8', c: '#fffaf0', e: '#c88aff'}, shape: 'wave',    motifs: ['note', 'note2', 'star', 'spark'],   emblem: 'note'});
sfaDefineTheme('chain',   {pal: {o: '#14161c', d: '#5b606e', a: '#9195a1', b: '#e4dfc8', c: '#ffffff', e: '#d8b868'}, shape: 'hex',     motifs: ['link', 'chain', 'nail', 'spark'],   emblem: 'link'});
sfaDefineTheme('tide',    {pal: {o: '#0a1a34', d: '#2a6ab0', a: '#5aa8e4', b: '#b8e0ff', c: '#ffffff', e: '#7af0e0'}, shape: 'wave',    motifs: ['wave', 'drop', 'shell', 'bubble'],  emblem: 'shell'});
sfaDefineTheme('lantern', {pal: {o: '#2a1c08', d: '#8a6c30', a: '#e8c060', b: '#ffe7a5', c: '#fff9e0', e: '#ff9a3c'}, shape: 'sun',     motifs: ['flame', 'moth', 'star', 'spark'],   emblem: 'lantern'});
sfaDefineTheme('blood',   {pal: {o: '#2a0808', d: '#7a1c1c', a: '#c4544a', b: '#f0a89a', c: '#fff0ec', e: '#ffd0a0'}, shape: 'spike',   motifs: ['blood', 'blade', 'slash', 'drop'],  emblem: 'blade'});
sfaDefineTheme('sand',    {pal: {o: '#2a1608', d: '#8a5a2a', a: '#d89a4a', b: '#f4d08a', c: '#fff6dc', e: '#4fe3cf'}, shape: 'scallop', motifs: ['grain', 'banner', 'flag', 'spark'], emblem: 'banner'});
sfaDefineTheme('thread',  {pal: {o: '#181830', d: '#4e50a0', a: '#8889c1', b: '#e3e0ff', c: '#ffffff', e: '#ffd870'}, shape: 'tri',     motifs: ['tri', 'node', 'thread', 'spark'],   emblem: 'tri'});
sfaDefineTheme('scarab',  {pal: {o: '#0a1a12', d: '#1f6a50', a: '#3fae8a', b: '#c8f27a', c: '#f4ffd0', e: '#ffd24a'}, shape: 'petal',   motifs: ['beetle', 'wing', 'spark', 'spore'], emblem: 'beetle'});
sfaDefineTheme('patria',  {pal: {o: '#0e1c3c', d: '#2f4f9a', a: '#6ea0e8', b: '#f4f8ff', c: '#ffffff', e: '#f2c14e'}, shape: 'sun',     motifs: ['sun', 'smoke', 'star', 'hoof'],     emblem: 'sun'});
sfaDefineTheme('fire',    {pal: {o: '#2a0a04', d: '#b02a10', a: '#ff6a3d', b: '#ffc36a', c: '#fff4c8', e: '#ffffff'}, shape: 'spike',   motifs: ['flame', 'ember', 'spark', 'flame'], emblem: 'flame'});
sfaDefineTheme('frost',   {pal: {o: '#0c1c2c', d: '#3a78a8', a: '#7ad0ff', b: '#cff3ff', c: '#ffffff', e: '#ffffff'}, shape: 'hex',     motifs: ['ice', 'shard', 'star', 'spark'],    emblem: 'ice'});
sfaDefineTheme('storm',   {pal: {o: '#20184a', d: '#6a58d8', a: '#ffe36a', b: '#fff6b0', c: '#ffffff', e: '#a89cff'}, shape: 'glitch',  motifs: ['bolt', 'spark', 'bolt', 'star'],    emblem: 'bolt'});
sfaDefineTheme('thorn',   {pal: {o: '#1a2010', d: '#4a5a30', a: '#879c60', b: '#cfe0a0', c: '#f4ffe0', e: '#d86a8a'}, shape: 'petal',   motifs: ['thorn', 'seed', 'vine', 'leaf'],    emblem: 'seed'});
sfaDefineTheme('plague',  {pal: {o: '#121c08', d: '#4a6a24', a: '#a4c56a', b: '#dcf0a0', c: '#f8ffe0', e: '#b070d8'}, shape: 'scallop', motifs: ['spore', 'shroom', 'drop', 'smoke'], emblem: 'shroom'});
sfaDefineTheme('alchemy', {pal: {o: '#24101e', d: '#6e3a60', a: '#a46191', b: '#edd0a5', c: '#fff6e8', e: '#7ae0b0'}, shape: 'hex',     motifs: ['flask', 'bubble', 'drop', 'spark'], emblem: 'flask'});
sfaDefineTheme('ink',     {pal: {o: '#080c14', d: '#2a4a68', a: '#5aa8d8', b: '#bfe4ff', c: '#ffffff', e: '#e04040'}, shape: 'spike',   motifs: ['slash', 'petal', 'ink', 'spark'],   emblem: 'blade'});
