"use strict";
/* ============================================================
   js/ui/skill-pixel-glyphs.js
   GLIFOS PIXEL de las habilidades en los botones del HUD (y en la ficha / panel de Habilidades).
   Antes los campeones de Ascensión y Expedición mostraban el mismo engranaje en las 3 habilidades y la misma
   estrella en la definitiva (skill-glyphs.js decide por palabras clave y todas caían en "nova"/"star"); solo
   se distinguían por el texto. Ahora cada habilidad de cada campeón tiene su propio glifo, dibujado con
   la grilla del juego: un MOTIVO de 12x12 (lo que hace la habilidad) + una INSIGNIA de 4x4 en la esquina
   (cómo: potencia, cura, rotura, sangrado, área, movimiento...). Todo procedural, sin recursos de terceros.
   Es solo presentación: no toca estadísticas, daño ni efectos de ningún kit.

   Paleta por letra:  # color del botón · l luz · d sombra · k trazo oscuro · a oro · r rojo · g verde · c celeste · w blanco
   Contorno de 1 px oscuro automático alrededor de toda la silueta (lenguaje de La Horda: contorno uniforme).
   Contrato (lo verifica tools/ux/test-skill-glyphs.js): dos habilidades del mismo kit nunca comparten motivo, ningún
   campeón cae en el glifo genérico y ninguna pareja motivo+insignia se repite en todo el roster.
   ============================================================ */
const PIX_MOTIFS = {
  sword:['.....ll.....','.....l#d....','.....l#d....','.....l#d....','.....l#d....','.....l#d....','..aaaaaaaa..','.....ad.....','.....ad.....','.....aa.....','....aaaa....','............'],
  swords:['ll........ll','l#l......l#l','.l#l....l#l.','..l#l..l#l..','...l#ll#l...','....l##l....','...a#ll#a...','..aa#..#aa..','.aa.l..l.aa.','.a..........','............','............'],
  dagger:['......l.....','.....l#.....','.....l#d....','.....l#d....','.....l#d....','.....l#d....','....aaaa....','.....ad.....','.....ad.....','.....aa.....','............','............'],
  claws:['..l..l..l...','..#l.#l.#l..','..#l.#l.#l..','.l#..l#.l#..','.#d..#d.#d..','.#..l#..#...','.d..#d..d...','....#.......','............','............','............','............'],
  slashes:['l......l....','#l....l#....','.#l..l#..l..','..#ll#..l#..','...##..l#...','..l#.l#l#...','.l#..#..#l..','l#..l#.l#...','#..l#..#....','...#........','............','............'],
  scythe:['...llllll...','..l#####d...','.l##dddd#d..','.##d....##..','.#d......#d.','.........ad.','........ad..','.......ad...','......ad....','.....ad.....','....ad......','............'],
  hammer:['..llllllll..','..l######d..','..l######d..','..ldddddd...','.....ad.....','.....ad.....','.....ad.....','.....ad.....','.....ad.....','.....aa.....','............','............'],
  banner:['.a..........','.a.#######..','.a.#lllll#d.','.a.#l###.#d.','.a.#l##.#d..','.a.#l#.#d...','.a.##.#d....','.a..........','.a..........','.a..........','.a..........','aaa.........'],
  arrow:['.........l..','........l#l.','.......l#..#','......l#....','.....l#.....','....l#d.....','...l#d......','..l#d.......','.ald........','alad........','aa..........','............'],
  rain:['..l...l...l.','..#...#...#.','.l#..l#..l#.','.#...#...#..','..l...l...l.','..#...#...#.','.l#..l#..l#.','.#...#...#..','............','..c.c.c.c.c.','............','............'],
  rifle:['.........l..','........l#..','.......l#d..','......l#d...','.....l#d....','..aaa#d.....','.aa#aa......','aa#a........','a#a.........','#a..........','............','............'],
  shield:['.##########.','.#llllll##d.','.#l#####.#d.','.#l#####.#d.','.#l######.d.','..#l#####d..','..#l####dd..','...#l###d...','....#l#d....','.....#d.....','............','............'],
  armor:['.ll......ll.','.l#l....l#l.','.l##llll##l.','..##d##d##..','..#########.','..##d##d##..','..#########.','...###dd##..','...##..d#...','...#d..#d...','............','............'],
  wall:['############','#ll#ll#ll#d#','#######d####','.#ll#ll#ll#.','.#######d##.','#ll#ll#ll#d#','############','#ll#ll#ll#d#','############','............','............','............'],
  castle:['#.#..#..#.#.','####.##.####','#lll#l##lll#','#ll#######d#','#ll#llll#lld','#ll#l##l#l#d','#ll#l##l#l#d','#lll#kk#lll#','#dddd#kk#ddd','############','............','............'],
  turret:['....aaaa....','...a####a...','.aaa#ll#aaa.','.aaa####aaa.','...a#kk#a...','..aa####aa..','..a#####da..','.aa#ll###aa.','.a#######da.','.##########.','############','............'],
  bell:['.....aa.....','....a##a....','...l####d...','...l####d...','..l######d..','..l######d..','.l########d.','.l########d.','############','....aaaa....','.....aa.....','............'],
  ember:['............','.....a......','....a#......','...a##a.....','...a##a.a...','..a####aa...','..a#ll##a...','.a##ll###a..','.a#######a..','..a##l##da..','...aaaaaa...','............'],
  storm:['...######...','..#llll###..','.#lllll####.','.##########.','..dddddddd..','....a..a....','...aa.aa....','..aa..a.....','.aaaa.aa....','...aa..a....','....a.......','............'],
  cloud:['....####....','..##llll##..','.##lllll###.','.#########d.','..dddddddd..','............','..c..c..c...','....c..c....','..c..c..c...','............','............','............'],
  wave:['............','............','..ll........','.l##l.......','l#..#l...ll.','#....#l.l##l','......#l#..#','.llll.##....','l####l#.llll','############','dddddddddddd','............'],
  vortex:['..llllll....','.l######l...','l##....##l..','#l.llll.#...','#.l####.#...','#.#.ll#.#...','#.#.....#...','#.l####l#...','.#d....d#...','..d####d....','............','............'],
  sprout:['....gg.gg...','...gggggg...','...ggg.gg...','....g..g....','....g..g....','.gg.ggg.....','gggg.g..ggg.','.ggg.g.gggg.','..g..g..ggg.','.....g......','....ddd.....','............'],
  tree:['....gggg....','..gggllggg..','.ggllllgggg.','gggllgggggg.','.gggggggggg.','..ggggdggg..','....gdd.....','.....a......','.....a......','.....a......','....aaa.....','............'],
  mushroom:['...aaaaaa...','..a######a..','.a#llll###a.','a##l###l###a','aa########aa','.aaaaaaaaaa.','....l##d....','....l##d....','....l##d....','...ll##dd...','............','............'],
  roots:['.....aa.....','.....aa.....','..a..aa..a..','..aa.aa.aa..','...aaaaaa...','..a.aaaa.a..','.aa..aa..aa.','aa...aa...aa','a....a.a...a','.....a......','............','............'],
  mound:['............','............','....llll....','...l####d...','..l######d..','.l########d.','.l#llll###d.','l##########d','l####dd####d','############','dddddddddddd','............'],
  crystal:['.....l......','....l#l.....','...l###d....','...l###d....','..l#####d...','..l##l##d...','..l#####d.l.','.l.l###d.l#.','.#l.l#d..l#d','.##.l#d.l##.','.d#d.dd.d#d.','............'],
  star:['.....ll.....','.....l#d....','....l##d....','llll#####ddd','.l#########.','..l#######d.','...l#####d..','...l##d##d..','..l##d.d##d.','..l#d...d#d.','............','............'],
  comet:['........ll..','.......l##l.','......l###d.','..ll..l###d.','.l##...l#d..','l##.l..ddd..','#l.l#.......','.l#l........','..l.........','............','............','............'],
  sun:['.....a......','..a..a..a...','...a.aa.a...','....####....','a..######..a','aaa######aaa','a..######..a','....####....','...a.aa.a...','..a..a..a...','.....a......','............'],
  moon:['....llll....','..ll###.....','.l##d.......','.l#d........','l##d........','l#d.........','l##d........','.l#d.....ll.','.l##d...l#d.','..ll###ll#..','....lll#d...','............'],
  eclipse:['....aaaa....','..aa####aa..','.a##kkkk##a.','.a#kkkkkk#a.','a##kkkkkk##a','a##kkkkkk##a','.a#kkkkkk#a.','.a##kkkk##a.','..aa####aa..','....aaaa....','............','............'],
  blackhole:['............','...llllll...','..l######l..','.l##kkkk##l.','.#kk....kk#.','.#k......k#.','.#kk....kk#.','.l##kkkk##d.','..d######d..','...dddddd...','............','............'],
  orbit:['....cc......','...c##c.....','..c#..#c....','.c#.aaa.#c..','c#.aaaaa.#c.','c#.aaaaa.#c.','.c#.aaa.#c..','..c#...#c...','...c###c....','............','............','............'],
  drop:['.....l......','.....#l.....','....l##.....','....l##d....','...l###d....','..l####dd...','..l####dd...','..l#l###d...','..l#l###d...','...l###d....','....ddd.....','............'],
  flask:['....llll....','.....l#d....','.....l#d....','....l##dd...','...l####d...','..l##rr##d..','..l#rrrr#d..','.l##rrrr##d.','.l########d.','..dddddddd..','............','............'],
  alembic:['.......ll...','......l#d...','...aaa##aaa.','..a###d..ad.','.a#####d.ad.','.a#ll##d.ad.','.a#####d.ad.','..a###d..ad.','...aaa...aa.','..aaaaaa....','............','............'],
  goblet:['.llllllllll.','.l########d.','.l#rrrrr##d.','..l#rrr##d..','...l###dd...','.....#d.....','.....#d.....','.....#d.....','....####....','...######...','............','............'],
  cask:['..aaaaaaaa..','.a########a.','a#l######dd#','aaaaaaaaaaaa','a#l######d#a','a#l##aa##d#a','a#l##aa##d#a','aaaaaaaaaaaa','a#l######d#a','.a########a.','..aaaaaaaa..','............'],
  skull:['...######...','..#llllll#..','.#lllllll##.','.#lkk##kkl#.','.#lkk##kkl#.','.##lllllld#.','..#l#kk#d#..','...#ll##d...','...#l#l#d...','....#d#d....','............','............'],
  ghost:['....llll....','...l####d...','..l######d..','..l#kk#kk#d.','..l#kk#kk#d.','..l######d..','..l#.kk.#d..','..l######d..','..l##..###d.','..#d.##.d#d.','............','............'],
  demon:['l..........l','#l........l#','.#l.####.l#.','..#l####l#..','..l######d..','..l#aa#aad..','..l######d..','..l#kkkk#d..','...l#kk#d...','....l##d....','............','............'],
  eye:['............','............','...llllll...','.ll######ll.','l##kkkkkk##l','#kkkaaakkk#d','l##kkkkkk##d','.dd######dd.','...dddddd...','............','............','............'],
  mask:['.llllllllll.','l##########d','l#lll##lll#d','l#lkk##kkl#d','l#lkk##kkl#d','l##########d','.l###kk###d.','..l#k##k#d..','...l####d...','....dddd....','............','............'],
  masks:['.llll..llll.','l####dl####d','l#k#kdl#k#kd','l####dl####d','l#kk#dl####d','l####dl#kk#d','.l##d..l##d.','..dd....dd..','............','............','............','............'],
  beetle:['..l......l..','...l.##.l...','....l##l....','...l####d...','..l##ll##d..','l.l#l##l#d.d','..l#l##l#d..','l.l#l##l#d.d','..l##ll##d..','...l####d...','....dddd....','............'],
  wings:['ll........ll','l#l......l#l','l##l....l##l','l###l..l###d','.l##########','..l##l##l#d.','...l##a##d..','....l#a#d...','.....l#d....','............','............','............'],
  feather:['.........ll.','........l#d.','.......l##d.','......l##d..','.....l##d...','....l##d....','...l#ld.....','..l#l.......','.a#l........','aa..........','a...........','............'],
  bee:['...ll..ll...','..l#l..l#l..','...l.aa.l...','....aaaa....','...akaaka...','..aaaaaaaa..','..akkkkkka..','..aaaaaaaa..','...akkkka...','....aaaa....','.....aa.....','............'],
  swarm:['..a....a....','....a.......','.a....a..a..','......a.....','..a.a....a..','.a....a.....','....a..a.a..','.a....a.....','..a..a....a.','....a....a..','............','............'],
  needle:['..........ll','.........l#.','........l#..','.......l#...','......l#....','.....l#.....','....l#.a....','...l#..a.a..','..l#..a..a..','.l#a..a.a...','.l#....aa...','..l.........'],
  stitch:['............','l..l..l..l..','#l.#l.#l.#l.','.#l.#l.#l.#l','............','..a.a.a.a...','..a.a.a.a...','............','l..l..l..l..','#l.#l.#l.#l.','............','............'],
  scissors:['..l......l..','.l#l....l#l.','.l#l....l#l.','..l#l..l#l..','...l#ll#l...','....l##l....','...l#ll#l...','..l#d..l#d..','.aa#....#aa.','.a.a....a.a.','.aaa....aaa.','............'],
  hourglass:['.llllllllll.','.##########.','..l#aaaa#d..','...l#aa#d...','....l##d....','.....##.....','....l##d....','...l#aa#d...','..l#aaaa#d..','.##########.','.dddddddddd.','............'],
  clock:['...######...','..#llllll#..','.#l..a...l#.','.#l..a...l#.','#l...a....l#','#l...aaa..l#','#l........l#','.#l......l#.','.#l......d#.','..#dddddd#..','...######...','............'],
  note:['......ll....','......l#l...','......l#.l..','......l#....','......l#....','......l#....','..lll.l#....','.l###l#d....','.l###dd.....','..ddd.......','............','............'],
  horn:['..........aa','.........a#a','.l#####a.#a.','l###l####.a.','l####l####a.','l####lllll#.','l###l####a..','.l#####a.#a.','..ddd.....a.','.........aa.','............','............'],
  drum:['aaaaaaaaaaaa','a##########a','a#llllllll#a','aaaaaaaaaaaa','.a#l#l#l#da.','..a#l#l#da..','.a#l#l#l#da.','..aaaaaaaa..','.l........l.','l..........l','............','............'],
  portal:['....cccc....','..cc####cc..','.c##kkkk##c.','c##kkkkkk##c','c#kkkkkkkk#c','c#kkkkkkkk#c','c##kkkkkk##c','.c##kkkk##c.','..cc####cc..','....cccc....','............','............'],
  rift:['.....l#.....','....l#d.....','.....l#d....','....l#kd....','...l#kk#....','....#kk#d...','...#kkk#d...','..l#kk#d....','...l#kd.....','....l#d.....','.....#......','............'],
  chain:['..llll......','.l####d.....','.l#..#d.....','.l#..#llll..','.l####l####d','..ddd.l#..#d','......l#..#d','......l####d','.......ddd..','............','............','............'],
  hook:['....aaaa....','...a####a...','...a#..#a...','.......#a...','.......#a...','.......#a...','..l....#a...','..l#..l#a...','..l##l##a...','...l###a....','....lda.....','............'],
  anchor:['....aaaa....','...a#..#a...','...a#..#a...','....aaaa....','.....aa.....','..aaaaaaaa..','.....aa.....','.....aa.....','a....aa....a','aa...aa...aa','.aa..aa..aa.','..aaaaaaaa..'],
  lantern:['....aaaa....','...a#..#a...','..aaaaaaaa..','..al####da..','..al#aa#da..','..al#aa#da..','..al####da..','..al####da..','..aaaaaaaa..','...aaaaaa...','............','............'],
  candle:['.....a......','....aa......','....aaa.....','.....a......','....lll.....','....l#d.....','....l#d.....','....l#d.....','....l#d.....','..aaaaaaaa..','..aaaaaaaa..','............'],
  heart:['.lll....lll.','l###l..l###l','l####llll##d','l#########d.','.l########d.','..l######d..','...l####d...','....l##d....','.....ld.....','............','............','............'],
  ankh:['....aaaa....','...a#..#a...','...a#..#a...','....aaaa....','.....aa.....','.aaaaaaaaaa.','.....aa.....','.....aa.....','.....aa.....','.....aa.....','............','............'],
  crown:['l....l....l.','#l..l#l..l#.','#l.l###l.l#.','##l#####l##.','.##########.','.#aa#aa#aa#.','.##########.','.dddddddddd.','............','............','............','............'],
  halo:['...aaaaaa...','..a......a..','..a......a..','...aaaaaa...','....####....','...######...','..########..','..##d##d##..','..########..','............','............','............'],
  trap:['l.l.l.l.l.l.','#.#.#.#.#.#.','############','.##########.','aaaaaaaaaaaa','a..........a','a..........a','aaaaaaaaaaaa','............','............','............','............'],
  footprints:['..lll.......','.l###l......','.l###l......','..l#d.......','..lll.......','...dd.......','.......lll..','......l###l.','......l###l.','.......l#d..','.......lll..','........dd..'],
  boots:['...lll......','...l##d.....','...l##d.....','...l##d.....','...l##d.....','...l###d....','...l####dll.','...l#######d','..l#########','..aaaaaaaaaa','..aaaaaaaaaa','............'],
  door:['.llllllllll.','.l########d.','.l#llllll#d.','.l#l####l#d.','.l#l####l#d.','.l#l###al#d.','.l#l####l#d.','.l#l####l#d.','.l#l####l#d.','.##########.','............','............'],
  bowl:['....c..c....','.....c..c...','....c..c....','............','llllllllllll','l##########d','l##########d','.l########d.','..l######d..','...dddddd...','............','............'],
  bubble:['...cccccc...','..c.llll.c..','.c.l.....c..','.c.l......c.','c.l........c','c..........c','c..........c','.c........c.','.c........c.','..c......c..','...cccccc...','............'],
  splat:['....l..l....','.l..l##l..l.','..l.l##l.l..','l.l######l.l','.l########l.','..l######l..','.l########l.','l.l######l.l','..l.l##l.l..','.l..l##l..l.','....l..l....','............'],
  burst:['.....#......','..#..#..#...','...#.#.#....','....###.....','##########..','....###.....','...#.#.#....','..#..#..#...','.....#......','............','............','............'],
  glitch:['####....####','#ll#....#ll#','####kk..####','....kk......','..####..####','..#ll#..#ll#','..####kk####','kk......kk..','kk..####....','....#ll#....','....####....','............'],
  cursor:['.l..........','.l#.........','.l##........','.l###.......','.l####......','.l#####.....','.l######....','.l#####ll...','.l##l.l#d...','.ld...l#d...','.......l#d..','........dd..'],
  power:['.....aa.....','.....aa.....','..a..aa..a..','.aa..aa..aa.','aa...aa...aa','a....aa....a','a..........a','aa........aa','.aa......aa.','..aaaaaaaa..','............','............'],
  siren:['.....aa.....','.a...aa...a.','..a.####.a..','...l####d...','..l######d..','..l##ll##d..','..l######d..','..l######d..','.aaaaaaaaaa.','.aaaaaaaaaa.','............','............'],
  wrench:['..lll..lll..','.l##l..l##l.','.l#d....#d..','..l#ll.l#d..','...l##.#d...','....l##d....','....l##d....','....l##d....','....l##d....','...l####d...','....dddd....','............'],
  padlock:['...aaaaaa...','..a......a..','..a......a..','..a......a..','.llllllllll.','.l########d.','.l###kk###d.','.l###kk###d.','.l####k####d','.l########d.','.dddddddddd.','............'],
  barrier:['............','a..a..a..a..','a..a..a..a..','aaaaaaaaaaaa','a..a..a..a..','a..a..a..a..','aaaaaaaaaaaa','a..a..a..a..','a..a..a..a..','a..a..a..a..','............','............'],
  triskele:['....l##l....','...l####d...','....l##d....','.....##.....','..l..##..l..','.l##.##.l##.','l####ll####d','.l##dkkd.#d.','..d..kk..d..','............','............','............'],
  spool:['llllllllllll','dddddddddddd','.a#a#a#a#a#.','.#a#a#a#a#a.','.a#a#a#a#a#.','.#a#a#a#a#a.','dddddddddddd','llllllllllll','.......a....','........a...','.........a..','............'],
  mirror:['..llllllll..','.l########d.','l##llllll##d','l#l######l#d','l#l######l#d','l#l######l#d','l##llllll##d','.l########d.','...aaaaaa...','.....aa.....','.....aa.....','....aaaa....'],
  frame:['aaaaaaaaaaaa','a##########a','a#llllllll#a','a#l......d#a','a#l......d#a','a#l......d#a','a#l......d#a','a#dddddddd#a','a##########a','aaaaaaaaaaaa','............','............'],
  hive:['....aaaa....','..aaaaaaaa..','.aaakkkkaaa.','.aakkaakkaa.','..aaaaaaaa..','.aaakkkkaaa.','.aakkaakkaa.','..aaaaaaaa..','...aaaaaa...','....aaaa....','............','............'],
  flower:['....rr.rr...','...rrrrrrr..','....rr#rr...','...rrrrrrr..','....rr.rr...','.....g......','..gg.g......','..ggggg.....','.....g.gg...','.....g..gg..','............','............'],
  furnace:['.dddddddddd.','d##########d','d#llllllll#d','d#l..aa..d#d','d#l.aaaa.d#d','d#l.aaaa.d#d','d#ldddddd#d.','d##########d','d##d####d##d','dddddddddddd','............','............'],
  valve:['....aaaa....','...a####a...','.aaa#..#aaa.','.a#.a##a.#a.','.a#.a##a.#a.','.aaa#..#aaa.','...a####a...','....aaaa....','.....aa.....','............','............','............'],
  shovel:['.....lll....','.....l#d....','.....l#d....','.....a#d....','.....aad....','....aaaa....','...l####d...','..l######d..','..l######d..','...l####d...','....dddd....','............'],
  tablet:['..llllllll..','.l########d.','.l#a.aa.a#d.','.l#........d','.l#aa.a.aa#d','.l#........d','.l#a..aa.a#d','.l#........d','.l#aaa.aa.#d','.l##########','.dddddddddd.','............'],
  quill:['.........ll.','........l#d.','.......l##d.','......l##d..','.....l##d...','....l##d....','...l#ld.....','..l#d.......','.l#d........','kkd.........','kk..........','............'],
  eraser:['............','............','...aaaaaaaa.','..a#llllll#a','.a#lllllll#a','a#lllllllldd','aaaaaaaaaa..','............','.l.l.l.l.l..','............','............','............'],
  map:['llllllllllll','l#a#..l#a.#d','l#a#..l#.a#d','l##....#.##d','l#.aa.l#..#d','l#aa..l#aa#d','l#....l#.a#d','l#.a..l#..#d','l##########d','dddddddddddd','............','............'],
  gavel:['..llllll....','.l######d...','.l######d.l.','..dddddd.l#.','........l#..','.......l#...','......l#....','.....l#.....','....l#......','..aaaaaaaa..','..aaaaaaaa..','............'],
  scroll:['.llllllllll.','l##########d','.l########d.','.l#kkkkk#d..','.l#######d..','.l#kkkkk#d..','.l#######d..','.l#kkk###d..','l##########d','.dddddddddd.','............','............'],
  swap:['....#.......','...##.......','..###ll#####','.#####..###d','..###.......','...##.......','....d.......','.......d....','.......##...','###ll###....','d###..####..','.......##...'],
  scales:['.....aa.....','aaaaaaaaaaaa','..a..aa..a..','..a..aa..a..','.l#l.aa.l#l.','l###l.aal###','l###d.aadl##','.ddd..aa.dd.','......aa....','....aaaaaa..','............','............'],
  prism:['.....l......','....l#d.....','...l###d....','...l#kk#d...','..l##kk##d..','..l######d..','.l########d.','.l#########d','llllllllllll','............','............','............'],
  rays:['a...a...a...','.a..a..a....','..a.a.a.....','...aaa......','aaaa####....','...aaa......','..a.a.a.....','.a..a..a....','a...a...a...','............','............','............'],
  curtain:['aaaaaaaaaaaa','r#rr#rr#rr#r','r#rr#rr#rr#r','rr#rr##rr#rr','.rrrr..rrrr.','.rrr....rrr.','.rr......rr.','.r........r.','.r........r.','............','............','............'],
  plate:['..llllllll..','.l########d.','l##########d','l#llllllll#d','l#l######l#d','l#l######l#d','l#llllllll#d','l##########d','.l########d.','..dddddddd..','............','............'],
  nails:['..l.l..l.l..','..#.#..#.#..','.a#a#aa#a#a.','aaaaaaaaaaaa','a##########a','a#llllllll#a','a#l######d#a','aaaaaaaaaaaa','.a#......#a.','aaa......aaa','............','............'],
  brace:['l..........l','#l........l#','.#l......l#.','..#l....l#..','...#llllll..','....#aaaa#..','....#aaaa#..','...l#llll#d.','..l#d....#d.','.l#d......#d','l#d........d','............'],
  ball:['.....aa.....','.....aa.....','.....aa.....','....aaaa....','..llllllll..','.l########d.','l##llll####d','l#l#######dd','l##########d','.l########d.','..dddddddd..','............'],
  dune:['............','............','............','....lll.....','..ll###ll...','.l#######ll.','l##########l','#l.llll.l##d','#.l....l.l#d','l..........d','dddddddddddd','............'],
  mountain:['.....l......','....l#......','...l##d.....','..l###d.l...','..l####dl#..','.l#####l##d.','l######l###d','####l##l####','l#l####l####','############','dddddddddddd','............'],
  compass:['....cccc....','..cc.cc.cc..','.c...aa...c.','.c...aa...c.','cc..aaaa...c','cc..aaaa..cc','.c...aa...c.','.c...aa...c.','..cc.cc.cc..','....cccc....','............','............'],
  fist:['..l#l#l#l...','.l#######d..','.l#######d..','.l#######d..','.l#llllll#d.','.l#######d..','..l######d..','...l####d...','...l####d...','...aaaaaa...','...aaaaaa...','............'],
  rod:['.....ll.....','....l##d....','.....##.....','....l##d....','.....##.....','....l##d....','.....##.....','....l##d....','...aaaaaa...','...aaaaaa...','....aaaa....','............'],
  circuit:['aa..........','.a..cccccc..','.a..c....c..','.aaaac..aaaa','....c..a....','....c..a....','.aaaac.a.aa.','.a..c..a.a..','.a..cccca...','aa..........','............','............'],
  shears:['.l......l...','l#l....l#l..','l#l....l#l..','.l#l..l#l...','..l#llld....','...l##d.....','..l#ll#d....','.l#d..l#d...','aaa....aaa..','a.a....a.a..','aaa....aaa..','............'],
  trumpet:['............','........l...','........l#d.','.......l##d.','aaaaal####d.','a###l######d','a###l######d','aaaaal####d.','a.a...l##d..','aaa...l#d...','......ld....','............'],
  repeat:['..llllllll..','.l########d.','l##......##d','l#........#d','l##.......ld','.ldlll#..#..','.....l##.#..','....l###.#..','.....l##.#..','......d..#..','............','............'],
  fan:['....l##l....','..l.l##l.l..','.l#.l##l.#d.','l##.l##l.##d','l#l.l##l.l#d','.l..l##l..d.','....l##l....','.....aa.....','.....aa.....','....aaaa....','............','............'],
  updraft:['.....l......','....l##.....','...l#..#....','....l#l.....','.....l......','..l..#..l...','.l#.l#d.l#..','..l.l#d.l...','.....#......','....l#d.....','............','............'],
  bottle:['....aaaa....','....a##a....','....l##d....','....l##d....','...l####d...','..l######d..','..l#rrrr#d..','..l#rrrr#d..','..l######d..','..l######d..','..dddddddd..','............'],
  toast:['llllll.llll.','l####l.l##l.','l#rr#l.l#rl.','.l##d...l#d.','..ld.....ld.','..#.......#.','..#.......#.','.###.....###','............','............','............','............'],
  wound:['....r.......','.....r.l....','..l...rl....','.l#l...r....','.l##l..r....','..l#d.rrr...','...l#drrr...','..r.l#drr...','.rr..ddr....','..r....r....','............','............'],
  pact:['.lll....lll.','l###l..l###l','l####llll##d','l####a#a##d.','.l####a###d.','..l##a#a#d..','...l####d...','....l##d....','.....ld.....','............','............','............'],
  sunstep:['....aaaa....','..aa####aa..','.a########a.','a##########a','a#llllllll#a','a##########a','.a########a.','..aa####aa..','....aaaa....','.c..c..c..c.','..c.c..c.c..','............'],
  bark:['.aaaaaaaaaa.','a##l#d#l###a','a#l##d##l#da','a##ld#l###da','a#l##d##l#da','a##l#dd#l#da','a#l###d##lda','a##l#d#l###a','a#l##d##l#da','.aaaaaaaaaa.','............','............'],
  tombstone:['....llll....','...l####d...','..l######d..','..l##a###d..','..l#aaa##d..','..l##a###d..','..l##a###d..','..l######d..','.llllllllll.','.dddddddddd.','............','............'],
};
// Insignias de 4x4 (esquina inferior derecha): cómo actúa la habilidad.
const PIX_PIPS = {
  none:null,
  up:['.aa.','aaaa','.aa.','.aa.'],
  plus:['.gg.','gggg','gggg','.gg.'],
  drop:['.rr.','.rr.','rrrr','.rr.'],
  ring:['.cc.','c..c','c..c','.cc.'],
  arrow:['.c..','cccc','cccc','.c..'],
  x:['r..r','.rr.','.rr.','r..r'],
  spark:['.a..','aaaa','.aa.','a..a'],
  snow:['c.c.','.cc.','cccc','c.c.'],
  flame:['.r..','rrr.','rrra','.rr.'],
  bolt:['..aa','.aa.','aaaa','.a..'],
  skull:['wwww','wkkw','wwww','w.w.'],
  dots:['a..a','....','.aa.','a..a']
};
// Qué lleva cada habilidad. Clave "campeón:ranura" (0, 1, 2 y "u" = definitiva) -> "motivo+insignia".
// Las 6 con ícono PNG propio (SKILL_ICON_IMG) no se tocan y no figuran acá.
const SKILL_PIXEL_MAP = {
  "tanque:u":"horn+up",
  "guerrero:0":"dagger+drop","guerrero:1":"claws","guerrero:2":"trap+dots","guerrero:u":"mask+skull",
  "mago:u":"comet+flame",
  "soporte:0":"sun+plus","soporte:1":"sword+up","soporte:2":"shield+plus","soporte:u":"crown+up",
  "segador:0":"scythe","segador:1":"armor+up","segador:2":"tombstone+x","segador:u":"skull+drop",
  "axiom:0":"glitch+x","axiom:1":"cursor+spark","axiom:2":"portal+arrow","axiom:u":"power+x",
  "profeta:0":"ankh+plus","profeta:1":"eye+up","profeta:2":"moon+spark","profeta:u":"wings+up",
  "musashi:0":"sword+arrow","musashi:1":"ghost+arrow","musashi:2":"slashes","musashi:u":"swords+spark",
  "cazadora:0":"arrow+x","cazadora:1":"trap+ring","cazadora:2":"rain","cazadora:u":"claws+flame",
  "nigromante:0":"ghost+skull","nigromante:1":"fist+skull","nigromante:2":"cloud+skull","nigromante:u":"demon+skull",
  "libertador:0":"rifle","libertador:1":"ball+arrow","libertador:2":"boots+bolt","libertador:u":"mountain+up",
  "ilkan:0":"banner","ilkan:1":"dune+up","ilkan:2":"compass+up","ilkan:u":"fist+ring",
  "ilkan_colossus:0":"fist+x","ilkan_colossus:1":"dune+x","ilkan_colossus:2":"boots+ring","ilkan_colossus:u":"footprints+skull",
  "ynara:0":"eye+bolt","ynara:1":"bowl+plus","ynara:2":"door+arrow","ynara:u":"halo+up",
  "myla:0":"bowl+ring","myla:1":"splat+drop","myla:2":"bubble+up","myla:u":"burst+x",
  "brasa:0":"turret+ring","brasa:1":"cloud+ring","brasa:2":"wrench+x","brasa:u":"siren+up",
  "eslabon:0":"hook+arrow","eslabon:1":"barrier+x","eslabon:2":"padlock+up","eslabon:u":"chain+ring",
  "morwen:0":"drop+dots","morwen:1":"crystal+x","morwen:2":"flask+up","morwen:u":"alembic+ring",
  "farolero:0":"lantern+up","farolero:1":"star+spark","farolero:2":"boots+arrow","farolero:u":"candle+plus",
  "iria:0":"anchor+x","iria:1":"stitch+bolt","iria:2":"scissors+x","iria:u":"triskele+ring",
  "vesper:0":"needle+dots","vesper:1":"stitch+arrow","vesper:2":"scissors+dots","vesper:u":"spool+ring",
  "nahir:0":"crystal+dots","nahir:1":"mirror+arrow","nahir:2":"swords+x","nahir:u":"frame+ring",
  "baltra:0":"bell+up","baltra:1":"shield+ring","baltra:2":"hammer+arrow","baltra:u":"horn+ring",
  "maura:0":"roots+arrow","maura:1":"bark+up","maura:2":"shears+x","maura:u":"tree+arrow",
  "dariel:0":"note+x","dariel:1":"drum+arrow","dariel:2":"repeat+spark","dariel:u":"trumpet+ring",
  "orsa:0":"rod+bolt","orsa:1":"rifle+up","orsa:2":"circuit+bolt","orsa:u":"storm+ring",
  "tibor:0":"swarm+x","tibor:1":"hive+arrow","tibor:2":"flower+up","tibor:u":"bee+ring",
  "zahra:0":"furnace+flame","zahra:1":"ember+snow","zahra:2":"boots+flame","zahra:u":"valve+ring",
  "renko:0":"mound+x","renko:1":"mountain+dots","renko:2":"shovel+x","renko:u":"tablet+ring",
  "sira:0":"quill+arrow","sira:1":"footprints+arrow","sira:2":"eraser+x","sira:u":"map+ring",
  "nano_gm:0":"gavel+x","nano_gm:1":"scroll+up","nano_gm:2":"swap+spark","nano_gm:u":"scales+ring",
  "facu_gm:0":"hook+dots","facu_gm:1":"bubble+x","facu_gm:2":"wave+up","facu_gm:u":"vortex+ring",
  "aurelia:0":"prism+arrow","aurelia:1":"rays+x","aurelia:2":"sunstep+arrow","aurelia:u":"sun+ring",
  "khepri:0":"swarm+arrow","khepri:1":"beetle+up","khepri:2":"wings+arrow","khepri:u":"eclipse+ring",
  "velmira:0":"mask+arrow","velmira:1":"masks+ring","velmira:2":"swap+arrow","velmira:u":"curtain+ring",
  "vhal:0":"star+arrow","vhal:1":"vortex+dots","vhal:2":"orbit+up","vhal:u":"blackhole+ring",
  "bront:0":"plate+arrow","bront:1":"wall+up","bront:2":"crystal+ring","bront:u":"castle+up",
  "oriel:0":"door+spark","oriel:1":"ghost+dots","oriel:2":"portal+spark","oriel:u":"rift+ring",
  "saelis:0":"fan+arrow","saelis:1":"updraft+up","saelis:2":"feather+spark","saelis:u":"wings+ring",
  "solciju:0":"goblet+skull","solciju:1":"cask+drop","solciju:2":"toast+up","solciju:u":"bottle+ring",
  "veyra:0":"wound+x","veyra:1":"dagger+arrow","veyra:2":"pact+x","veyra:u":"heart+drop",
  "brakk:0":"wall+x","brakk:1":"nails+ring","brakk:2":"brace+up","brakk:u":"ball+ring",
  "morveth:0":"sprout+skull","morveth:1":"cloud+drop","morveth:2":"mushroom+up","morveth:u":"tree+skull",
  "aelith:0":"clock+x","aelith:1":"crystal+spark","aelith:2":"boots+up","aelith:u":"hourglass+ring"
};
const SKILL_PIXEL_COLORS = {k:"#0d1220", a:"#ffd35a", r:"#ff6a58", g:"#7dff9a", c:"#7fe3ff", w:"#f4f1e6"};
const _pixTint = (hex, t)=>{ // t>0 aclara hacia blanco, t<0 oscurece hacia negro
  const n = parseInt(hex.slice(1), 16), c = [n>>16&255, n>>8&255, n&255].map(v=>Math.round(t>0 ? v+(255-v)*t : v*(1+t)));
  return "#" + c.map(v=>v.toString(16).padStart(2, "0")).join("");
};
function skillPixelGlyphKey(champId, slot){ return SKILL_PIXEL_MAP[champId + ":" + (slot===3 || slot==="ult" ? "u" : slot)] || null; }
// Grilla 14x14 (12 del motivo + 1 px de contorno): filas de caracteres, '.' = vacío.
function skillPixelGrid(key){
  const [m, p] = key.split("+"), rows = PIX_MOTIFS[m];
  if(!rows) return null;
  const g = Array.from({length:14}, ()=>Array(14).fill("."));
  rows.forEach((r, y)=>{ for(let x=0; x<12; x++) g[y+1][x+1] = r[x] || "."; });
  const pip = PIX_PIPS[p || "none"];
  if(pip){ // la insignia se apoya sobre el motivo con un borde oscuro de 1 px
    for(let y=8; y<14; y++) for(let x=8; x<14; x++) if(g[y][x] !== ".") g[y][x] = "k";
    pip.forEach((r, y)=>{ for(let x=0; x<4; x++) if(r[x] !== ".") g[y+9][x+9] = r[x]; });
  }
  return g.map(r=>r.join(""));
}
const _pixUri = {};
function skillPixelGlyphUriFromKey(key, color){
  const id = key + color;
  if(_pixUri[id]) return _pixUri[id];
  const g = skillPixelGrid(key); if(!g) return null;
  const pal = Object.assign({"#":color, l:_pixTint(color, .55), d:_pixTint(color, -.35)}, SKILL_PIXEL_COLORS);
  const solid = (x, y)=> y>=0 && y<14 && x>=0 && x<14 && g[y][x] !== ".";
  let out = "";
  for(let y=0; y<14; y++) for(let x=0; x<14; x++){ // contorno: vacío con vecino ocupado (4 direcciones + diagonales)
    if(solid(x, y)) continue;
    if(solid(x-1,y) || solid(x+1,y) || solid(x,y-1) || solid(x,y+1) || solid(x-1,y-1) || solid(x+1,y-1) || solid(x-1,y+1) || solid(x+1,y+1))
      out += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0b0f18"/>`;
  }
  for(let y=0; y<14; y++) for(let x=0; x<14; x++) if(solid(x, y)) out += `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[g[y][x]] || color}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 16 16" shape-rendering="crispEdges">${out}</svg>`;
  return _pixUri[id] = "data:image/svg+xml," + encodeURIComponent(svg);
}
// Glifo pixel de una habilidad de un campeón (null si no tiene: el llamador usa el símbolo de skill-glyphs.js).
function skillPixelGlyphUri(champId, slot, color){
  const key = skillPixelGlyphKey(champId, slot);
  return key ? skillPixelGlyphUriFromKey(key, color) : null;
}
