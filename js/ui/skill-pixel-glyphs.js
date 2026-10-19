"use strict";
/* ============================================================
   js/ui/skill-pixel-glyphs.js
   MOTIVOS y MAPA de los íconos de habilidad del HUD (y del panel de Habilidades, la ficha y los refuerzos).
   Cada habilidad de cada campeón (43 + el Coloso de Ilkan) tiene su propio motivo de 12x12, sin repetir en todo el
   roster; el render (16x16, 6 colores, contorno de 1 px, marco por categoría) lo hace el contrato de pixel-icons.js.
   Los motivos nuevos están en skill-icon-motifs.js (generado por tools/art/skill-motifs/gen.py) y pisan a los de acá.
   Es solo presentación: no toca estadísticas, daño ni efectos de ningún kit.
   Letras: # cuerpo · l luz · d sombra · k detalle oscuro · a acento (a r g c w colapsan a un solo acento por ícono).
   Verifica: tools/ux/test-skill-glyphs.js (glifos únicos por kit) y tools/art/check-skill-icons.js (contrato).
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
  bolt:['........l##.','.......l##d.','......l##d..','.....l##d...','....l#####d.','.....ddd##d.','........##d.','.......l#d..','......l#d...','.....l#d....','....l#d.....','....ld......'],
  frost:['.....##.....','.#..l##l..#.','..#..##..#..','...#.##.#...','.l..####..l.','#####aa#####','#####aa#####','.l..####..l.','...#.##.#...','..#..##..#..','.#..l##l..#.','.....##.....'],
  cross:['....llll....','....l##d....','....l##d....','....l##d....','llll####llll','l##########d','l##########d','lddd####dddd','....l##d....','....l##d....','....l##d....','....lddd....'],
};
// Qué lleva cada habilidad. Clave "campeón:ranura" (0, 1, 2 y "u" = definitiva) -> "motivo+insignia".
// Las 6 con ícono PNG propio (SKILL_ICON_IMG) no se tocan y no figuran acá.
const SKILL_PIXEL_MAP = {
  "tanque:0":"tornado","tanque:1":"shieldrush","tanque:2":"raisedfist","tanque:u":"horn",
  "guerrero:0":"dagger","guerrero:1":"triple","guerrero:2":"beartrap","guerrero:u":"plaguemask",
  "mago:0":"flamewall","mago:1":"frost","mago:2":"chainbolt","mago:u":"meteor",
  "soporte:0":"sun","soporte:1":"sword","soporte:2":"shield","soporte:u":"halo",
  "segador:0":"scythe","segador:1":"chestplate","segador:2":"tombstone","segador:u":"reaper",
  "axiom:0":"glitch","axiom:1":"cursor","axiom:2":"portal","axiom:u":"power",
  "profeta:0":"ankh","profeta:1":"eye","profeta:2":"moon","profeta:u":"wings",
  "musashi:0":"katana","musashi:1":"afterimage","musashi:2":"millcuts","musashi:u":"swords",
  "cazadora:0":"arrow","cazadora:1":"snare","cazadora:2":"arrowrain","cazadora:u":"wolfhead",
  "nigromante:0":"wisp","nigromante:1":"golem","nigromante:2":"plaguecloud","nigromante:u":"demon",
  "libertador:0":"rifle","libertador:1":"grenade","libertador:2":"horse","libertador:u":"mountain",
  "ilkan:0":"banner","ilkan:1":"dunes","ilkan:2":"compass","ilkan:u":"colossus",
  "ilkan_colossus:0":"avalanche","ilkan_colossus:1":"sinkhole","ilkan_colossus:2":"footprint","ilkan_colossus:u":"threesteps",
  "ynara:0":"glare","ynara:1":"bowl","ynara:2":"stophand","ynara:u":"pray",
  "myla:0":"yogurtower","myla:1":"splat","myla:2":"bubble","myla:u":"tantrum",
  "brasa:0":"turret","brasa:1":"steam","brasa:2":"wrench","brasa:u":"siren",
  "eslabon:0":"hook","eslabon:1":"barrier","eslabon:2":"padlock","eslabon:u":"chainlinks",
  "morwen:0":"drop","morwen:1":"saltcrystal","morwen:2":"flask","morwen:u":"alembic",
  "farolero:0":"lantern","farolero:1":"flash","farolero:2":"steppingstone","farolero:u":"candle",
  "iria:0":"anchor","iria:1":"taut","iria:2":"scissors","iria:u":"triskele",
  "vesper:0":"needle","vesper:1":"sew","vesper:2":"frayed","vesper:u":"spool",
  "nahir:0":"shards","nahir:1":"mirror","nahir:2":"crosscut","nahir:u":"gallery",
  "baltra:0":"anvil","baltra:1":"dome","baltra:2":"clapper","baltra:u":"ringing",
  "maura:0":"roots","maura:1":"logshield","maura:2":"shears","maura:u":"walktree",
  "dariel:0":"note","dariel:1":"drum","dariel:2":"repeatsign","dariel:u":"trumpet",
  "orsa:0":"rod","orsa:1":"stock","orsa:2":"circuit","orsa:u":"stormcloud",
  "tibor:0":"beecloud","tibor:1":"hive","tibor:2":"flower","tibor:u":"bee",
  "zahra:0":"furnace","zahra:1":"snowflame","zahra:2":"ashstep","zahra:u":"valve",
  "renko:0":"furrow","renko:1":"mound","renko:2":"shovel","renko:u":"stele",
  "sira:0":"quill","sira:1":"backtrack","sira:2":"eraser","sira:u":"compassrose",
  "nano_gm:0":"gavel","nano_gm:1":"scroll","nano_gm:2":"invert","nano_gm:u":"scales",
  "facu_gm:0":"riptide","facu_gm:1":"pressure","facu_gm:2":"wave","facu_gm:u":"whirlpool",
  "aurelia:0":"prism","aurelia:1":"refract","aurelia:2":"lightstep","aurelia:u":"rosewindow",
  "khepri:0":"locusts","khepri:1":"carapace","khepri:2":"elytra","khepri:u":"scarab",
  "velmira:0":"mask","velmira:1":"masks","velmira:2":"twoface","velmira:u":"curtain",
  "vhal:0":"shootingstar","vhal:1":"gravwell","vhal:2":"orbit","vhal:u":"singularity",
  "bront:0":"plate","bront:1":"platewall","bront:2":"pulsecrystal","bront:u":"citadel",
  "oriel:0":"tear","oriel:1":"echo","oriel:2":"worldstep","oriel:u":"scar",
  "saelis:0":"fan","saelis:1":"updraft","saelis:2":"feather","saelis:u":"featherstorm",
  "solciju:0":"goblet","solciju:1":"cask","solciju:2":"toast","solciju:u":"bottle",
  "veyra:0":"wound","veyra:1":"slip","veyra:2":"pact","veyra:u":"stabbedheart",
  "brakk:0":"siegewall","brakk:1":"nails","brakk:2":"brace","brakk:u":"wreckball",
  "morveth:0":"sprout","morveth:1":"sporecloud","morveth:2":"mushroom","morveth:u":"rotflower",
  "aelith:0":"brokenclock","aelith:1":"splitseconds","aelith:2":"pocketwatch","aelith:u":"hourglass"
};
// Contrato de ícono (pixel-icons.js): 1 solo acento por ícono (el color de la primera letra de acento del motivo). Sin insignias.
const PIX_ACCENT_LETTERS = {a:"#fff0b0", r:"#ff6a58", g:"#7dff9a", c:"#7fe3ff", w:"#f4f1e6"};
function skillPixelGlyphKey(champId, slot){ return SKILL_PIXEL_MAP[champId + ":" + (slot===3 || slot==="ult" ? "u" : slot)] || null; }
// Grilla 14x14 (12 del motivo + 1 px de margen para el contorno): filas de caracteres, '.' = vacío.
function skillPixelGrid(key){
  const rows = PIX_MOTIFS[key.split("+")[0]];
  if(!rows) return null;
  const g = Array.from({length:14}, ()=>Array(14).fill("."));
  rows.forEach((r, y)=>{ for(let x=0; x<12; x++) g[y+1][x+1] = r[x] || "."; });
  return g.map(r=>r.join(""));
}
// Letras de acento (a r g c w) -> "a": el contrato permite un solo acento por ícono.
function skillPixelContractRows(grid14){ return grid14.map(r=>r.replace(/[rgcw]/g, "a")); }
function skillPixelAccent(key){
  const rows = PIX_MOTIFS[key.split("+")[0]] || [];
  for(const r of rows){ const m = /[argcw]/.exec(r); if(m) return PIX_ACCENT_LETTERS[m[0]]; }
  return PIX_ACCENT_LETTERS.a;
}
// Ícono (data URI PNG 16x16 del contrato) de una clave "motivo+insignia" en una ranura (0|1|2|3|"ult"|"basic").
function skillPixelGlyphUriFromKey(key, slot){
  const g = skillPixelGrid(key); if(!g) return null;
  return skillIconUriFromGlyph(skillPixelContractRows(g), slot, skillPixelAccent(key));
}
// Ícono de una habilidad de un campeón (null si no tiene entrada: el llamador usa el motivo genérico de skill-glyphs.js).
// El 3er argumento (color) quedó por compatibilidad: el color lo fija la ranura, no el llamador.
function skillPixelGlyphUri(champId, slot){
  const key = skillPixelGlyphKey(champId, slot);
  return key ? skillPixelGlyphUriFromKey(key, slot) : null;
}
