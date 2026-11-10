# -*- coding: utf-8 -*-
# Lote 375: textos nuevos de UI/PC (tutorial, Guía y «¿Cómo se juega?» con teclado y mando), producto (Tienda, pase,
# panel «Lo próximo que desbloqueás»), plataforma (mando de PlayStation, salas sin conexión) y gameplay (avisos de guardado).
# La clave es el texto del NODO ya armado. Las frases que llevan teclas se generan por dispositivo con las mismas piezas
# que devuelve ctlHint() (js/core/input-desk.js). Los números se pasan a {n} igual que hace js/i18n/i18n.js.
import re
T=[]
_seen={}
_NUM=re.compile(r'\d+(?:[.,]\d+)*')
def add(es,en,pt):
    """Normaliza los números a {n} (en las tres lenguas, que deben traerlos en el mismo orden) y evita repetidos."""
    n=_NUM.findall(es)
    assert n==_NUM.findall(en)==_NUM.findall(pt), ('orden de números distinto',es,en,pt)
    k=_NUM.sub('{n}',es); v=(_NUM.sub('{n}',en),_NUM.sub('{n}',pt))
    if k in _YA: return   # ya traducida en otro lote (misma traducción): no se duplica
    if k in _seen:
        assert _seen[k]==v, ('clave repetida con otra traducción',k)
        return
    _seen[k]=v; T.append((k,)+v)
low=lambda s:s[0].lower()+s[1:]
# piezas de ctlHint() que ya están en t06, t105, t350 y t361
_YA={'Movete con WASD o las flechas','▶ Movete con WASD o las flechas','Mantené Espacio (o clic) para pelear',
     'Apretá {n}, {n} o {n} (apuntan al mouse)','▶ Apretá R','▶ Pasá por encima del botín o apretá E',
     'Apretá las teclas de habilidad (apuntan al mouse)','Movete con clic derecho (o las flechas)','Apretá Q, W o E (apuntan al mouse)',
     '▶ Pasá por encima del botín o apretá F','Movete con el stick izquierdo','Mantené A para pelear',
     'Apretá X, Y o B (el stick derecho apunta)','▶ Apretá RB','▶ Pasá por encima del botín o apretá LT'}

# ---------------------------------------------------------------- piezas de ctlHint() por dispositivo
ES_,EN_,PT_=0,1,2
MOVE={'kb':('Movete con WASD o las flechas','Move with WASD or the arrow keys','Mova-se com WASD ou as setas'),
      'moba':('Movete con clic derecho (o las flechas)','Move with right click (or the arrows)','Mova-se com o clique direito (ou as setas)'),
      'pad':('Movete con el stick izquierdo','Move with the left stick','Mova-se com o analógico esquerdo')}
ATK={'kb':('Mantené Espacio (o clic) para pelear','Hold Space (or click) to fight','Segure Espaço (ou clique) para lutar'),
     'xbox':('Mantené A para pelear','Hold A to fight','Segure A para lutar'),
     'ps':('Mantené ✕ para pelear','Hold ✕ to fight','Segure ✕ para lutar')}
SKILL={'123':('Apretá 1, 2 o 3 (apuntan al mouse)','Press 1, 2 or 3 (they aim at the mouse)','Aperte 1, 2 ou 3 (miram no mouse)'),
       'qwe':('Apretá Q, W o E (apuntan al mouse)','Press Q, W or E (they aim at the mouse)','Aperte Q, W ou E (miram no mouse)'),
       'keys':('Apretá las teclas de habilidad (apuntan al mouse)','Press the ability keys (they aim at the mouse)','Aperte as teclas de habilidade (miram no mouse)'),
       'xbox':('Apretá X, Y o B (el stick derecho apunta)','Press X, Y or B (the right stick aims)','Aperte X, Y ou B (o analógico direito mira)'),
       'ps':('Apretá □, △ o ○ (el stick derecho apunta)','Press □, △ or ○ (the right stick aims)','Aperte □, △ ou ○ (o analógico direito mira)')}
def _ult(k): return ('Apretá '+k,'Press '+k,'Aperte '+k)
def _loot(k): return ('Pasá por encima del botín o apretá '+k,'Walk over the loot or press '+k,'Passe por cima do espólio ou aperte '+k)
# (mover, atacar, habilidad, definitiva, botín, tecla de revivir del tutorial, tecla de pausa, ¿mando?)
# En el tutorial el mando dice LT / Start (Xbox) o L2 / Options (PlayStation): js/systems/alpha-training.js usa padGlyph().
DEV=[
 (MOVE['kb'],  ATK['kb'],   SKILL['123'], _ult('R'),  _loot('E'),  'E',  'Esc',   False),  # teclado clásico
 (MOVE['kb'],  ATK['kb'],   SKILL['keys'],_ult('R'),  _loot('E'),  'E',  'Esc',   False),  # clásico con teclas reasignadas
 (MOVE['moba'],ATK['kb'],   SKILL['qwe'], _ult('R'),  _loot('F'),  'F',  'Esc',   False),  # MOBA
 (MOVE['moba'],ATK['kb'],   SKILL['keys'],_ult('R'),  _loot('F'),  'F',  'Esc',   False),  # MOBA con teclas reasignadas
 (MOVE['pad'], ATK['xbox'], SKILL['xbox'],_ult('RB'), _loot('LT'), 'LT', 'Start', True),   # mando Xbox / genérico
 (MOVE['pad'], ATK['ps'],   SKILL['ps'],  _ult('R1'), _loot('L2'), 'L2', 'Options', True),   # mando PlayStation
]
THALEN=('Thalen, el Tejedor Elemental','Thalen, the Elemental Weaver','Thalen, o Tecelão Elemental')

for mv,at,sk,ul,lo,rev,pause,pad in DEV:
    def F(es,en,pt):
        out=[]
        for i,s in ((ES_,es),(EN_,en),(PT_,pt)):
            out.append(s.format(move=mv[i],attack=at[i],skill=sk[i],skilll=low(sk[i]),ult=ul[i],ultl=low(ul[i]),loot=lo[i],
                                rev=rev,pause=pause,thalen=THALEN[i]))
        add(*out)
    # --- Arena de entrenamiento (js/systems/alpha-training.js: alphaTrainingText / alphaTrainingDeskText)
    F('Practicamos con Thalen; después volvés a tu campeón. {move}.',
      'We practice with Thalen; then you go back to your champion. {move}.',
      'Praticamos com Thalen; depois você volta ao seu campeão. {move}.')
    F('Tu guardián no se puede usar en el entrenamiento: practicamos con {thalen} y después volvés a tu campeón. {move}.',
      "Your guardian can't be used in training: we practice with {thalen} and then you go back to your champion. {move}.",
      'Seu guardião não pode ser usado no treino: praticamos com {thalen} e depois você volta ao seu campeão. {move}.')
    F('Practicás con {thalen}, tu guardián. {move}.',
      "You're practicing with {thalen}, your guardian. {move}.",
      'Você está praticando com {thalen}, seu guardião. {move}.')
    F('{attack}: tu mago dispara al enemigo cercano. Derrotá al esqueleto.',
      '{attack}: your mage fires at the nearby enemy. Defeat the skeleton.',
      '{attack}: seu mago dispara no inimigo próximo. Derrote o esqueleto.')
    F('{attack}: {thalen} golpea al enemigo cercano. Derrotá al esqueleto.',
      '{attack}: {thalen} hits the nearby enemy. Defeat the skeleton.',
      '{attack}: {thalen} golpeia o inimigo próximo. Derrote o esqueleto.')
    F('Las habilidades pegan mucho más que el ataque. {skill}.',
      'Abilities hit much harder than the attack. {skill}.',
      'As habilidades batem muito mais forte que o ataque. {skill}.')
    if pad:
        F('El barrido del botón y el número indican cuánto falta. Esperá a que se llene la MISMA habilidad que usaste recién (la que está resaltada) y volvé a apretar su botón.',
          "The button's sweep and number show how much is left. Wait for the SAME ability you just used (the highlighted one) to fill up and press its button again.",
          'A varredura do botão e o número indicam quanto falta. Espere a MESMA habilidade que você acabou de usar (a destacada) encher e aperte o botão dela de novo.')
    else:
        F('El barrido del botón y el número indican cuánto falta. Esperá a que se llene la MISMA habilidad que usaste recién (la que está resaltada) y volvé a apretar su tecla.',
          "The button's sweep and number show how much is left. Wait for the SAME ability you just used (the highlighted one) to fill up and press its key again.",
          'A varredura do botão e o número indicam quanto falta. Espere a MESMA habilidade que você acabou de usar (a destacada) encher e aperte a tecla dela de novo.')
    F('La definitiva (★) se carga peleando y se habilita avanzada la arena. Te la cargué: {ultl} para usarla contra el grupo.',
      'The ultimate (★) charges as you fight and unlocks as the arena progresses. I charged it for you: {ultl} to use it on the group.',
      'A definitiva (★) carrega lutando e é liberada conforme a arena avança. Eu a carreguei para você: {ultl} para usá-la contra o grupo.')
    F('Elyra cayó. Parate a su lado y MANTENÉ {rev} (unos 5 s). Un golpe no te corta; soltar o alejarte, sí.',
      "Elyra fell. Stand next to her and HOLD {rev} (about 5 s). A hit won't interrupt you; letting go or moving away will.",
      'Elyra caiu. Fique ao lado dela e SEGURE {rev} (uns 5 s). Um golpe não te interrompe; soltar ou se afastar, sim.')
    F('Apretá {pause}: el Panel táctico muestra tu kit, recargas, estados y equipo. Sola pausa; en multijugador la partida SIGUE. Cerralo con Continuar.',
      'Press {pause}: the Tactical panel shows your kit, cooldowns, statuses and gear. Playing solo it pauses; in multiplayer the match KEEPS GOING. Close it with Continue.',
      'Aperte {pause}: o Painel tático mostra seu kit, recargas, estados e equipamento. Sozinho pausa; no multijogador a partida CONTINUA. Feche com Continuar.')
    # renglón «▶ qué hacer» (un solo nodo: "▶ " + objetivo)
    F('▶ Mantené {rev} junto a Elyra hasta revivirla',
      '▶ Hold {rev} next to Elyra until she is revived',
      '▶ Mantenha {rev} junto a Elyra até reanimá-la')
    # --- Guía, nivel 1 (alphaGuideText)
    F('{move}. {attack}: tu guardián golpea al enemigo cercano. Las marcas del suelo avisan ataques: salí antes del impacto. La Arena de entrenamiento permite practicar sin perder progreso.',
      '{move}. {attack}: your guardian strikes the nearby enemy. Ground marks warn of attacks: get out before impact. The Training Arena lets you practice without losing progress.',
      '{move}. {attack}: seu guardião golpeia o inimigo próximo. As marcas no chão avisam ataques: saia antes do impacto. A Arena de treinamento permite praticar sem perder progresso.')
    # --- «¿Cómo se juega?» (js/ui/how-to-play.js: howtoDeskText)
    F('{move}. {attack}. Habilidades: {skilll}. La definitiva (ULT) se carga peleando: {ultl}.',
      '{move}. {attack}. Abilities: {skilll}. The ultimate (ULT) charges as you fight: {ultl}.',
      '{move}. {attack}. Habilidades: {skilll}. A definitiva (ULT) carrega lutando: {ultl}.')
    F('{move}.','{move}.','{move}.')
    F('{attack}. Tu guardián le pega solo al enemigo más cercano.',
      '{attack}. Your guardian automatically hits the nearest enemy.',
      '{attack}. Seu guardião bate sozinho no inimigo mais próximo.')
    F('Pegan mucho más fuerte que el ataque y tienen recarga. {skill}.',
      'They hit much harder than the attack and have a cooldown. {skill}.',
      'Batem muito mais forte que o ataque e têm recarga. {skill}.')
    F('Se carga peleando y se habilita desde el nivel 5 de la arena. Cuando brilla, usala: {ultl}.',
      'It charges as you fight and unlocks from arena level 5. When it glows, use it: {ultl}.',
      'Carrega lutando e é liberada a partir do nível 5 da arena. Quando brilhar, use: {ultl}.')
    F('Los enemigos sueltan objetos en el piso, con un haz de luz según su rareza. {loot}.',
      'Enemies drop items on the floor, with a light beam depending on rarity. {loot}.',
      'Os inimigos soltam objetos no chão, com um feixe de luz conforme a raridade. {loot}.')
    F('Apretá {pause}. Con la partida pausada ves tu Resumen, la ayuda y las opciones. En partidas online no hay pausa.',
      'Press {pause}. While paused you see your Summary, help and options. There is no pause in online matches.',
      'Aperte {pause}. Com a partida pausada você vê seu Resumo, a ajuda e as opções. Em partidas online não há pausa.')
    # --- consejos del Hechicero (js/systems/tutorial.js): la pieza de ctlHint() sola y con «▶ »
    for p in (mv,at,sk,ul,lo):
        add(*p); add(*['▶ '+x for x in p])

# solo con teclado
add('¿Qué hace cada habilidad? MANTENÉ el clic sobre su botón sin arrastrar: aparece su ficha y NO se lanza. Soltá para cerrarla.',
    'What does each ability do? HOLD the click on its button without dragging: its card appears and it does NOT fire. Release to close it.',
    'O que cada habilidade faz? MANTENHA o clique sobre o botão dela sem arrastar: aparece a ficha dela e ela NÃO é lançada. Solte para fechá-la.')
add('▶ Mantené el clic sobre una habilidad para leer su ficha',
    '▶ Hold the click on an ability to read its card',
    '▶ Mantenha o clique sobre uma habilidade para ler a ficha dela')
add('Cuando ves un + sobre una habilidad, tenés un punto para hacerla más fuerte. Hacele clic.',
    'When you see a + over an ability, you have a point to make it stronger. Click it.',
    'Quando você vê um + sobre uma habilidade, tem um ponto para deixá-la mais forte. Clique nele.')
# Guía, nivel 9 (se quitó la frase del Alpha)
add('Visitá la galería para comparar skins y cromas. Revisá el origen de cada recompensa en el Códice.',
    "Visit the gallery to compare skins and chromas. Check each reward's origin in the Codex.",
    'Visite a galeria para comparar skins e cromas. Confira a origem de cada recompensa no Códice.')
# tarjetas de modo sin la etiqueta ALPHA (index.html): ahora el nodo es el título entero
add('💠 GUERRA DE CRISTALES','💠 CRYSTAL WAR','💠 GUERRA DE CRISTAIS')
add('⚔ COLISEO','⚔ COLISEUM','⚔ COLISEU')

# ---------------------------------------------------------------- producto: Tienda, catálogo, pase
add('⚖ Todo el poder se consigue jugando, con el oro que ganás en las arenas. Las Brasas solo compran apariencia. Nunca poder. Míticos y Únicos no se venden: se fabrican o se ganan peleando.',
    "⚖ All power is earned by playing, with the gold you win in the arenas. Embers only buy looks. Never power. Mythic and Unique items aren't sold: they are crafted or won by fighting.",
    '⚖ Todo o poder se conquista jogando, com o ouro que você ganha nas arenas. As Brasas só compram aparência. Nunca poder. Míticos e Únicos não são vendidos: são fabricados ou conquistados lutando.')
add('⚖ Todo el poder se consigue jugando, con el oro que ganás en las arenas. Las Brasas compran apariencia y piezas de set (equipo). Las piezas también se consiguen jugando. Míticos y Únicos no se venden: se fabrican o se ganan peleando.',
    "⚖ All power is earned by playing, with the gold you win in the arenas. Embers buy looks and set pieces (gear). Pieces can also be found by playing. Mythic and Unique items aren't sold: they are crafted or won by fighting.",
    '⚖ Todo o poder se conquista jogando, com o ouro que você ganha nas arenas. As Brasas compram aparências e peças de set (equipamento). As peças também se conseguem jogando. Míticos e Únicos não são vendidos: são fabricados ou conquistados lutando.')
add('Más apariencias de set llegan más adelante. Con el set completo se ve su aura plena.',
    'More set looks are coming later. With the full set you see its full aura.',
    'Mais aparências de set chegam mais adiante. Com o set completo se vê sua aura plena.')
add('Cromas, skins y efectos visuales. Solo apariencia.',
    'Chromas, skins and visual effects. Looks only.',
    'Cromas, skins e efeitos visuais. Só aparência.')
add('Mientras tanto, esto ya es tuyo sin pagar:',
    'In the meantime, this is already yours for free:',
    'Enquanto isso, isto já é seu sem pagar:')
add('Probar apariencias','Try looks','Experimentar aparências')
add('Ver desafíos','View challenges','Ver desafios')
add('Reuní las piezas del set jugando: caen como botín o se reforjan con piezas repetidas.',
    'Collect the set pieces by playing: they drop as loot or are reforged from duplicate pieces.',
    'Reúna as peças do set jogando: caem como espólio ou são reforjadas com peças repetidas.')
add('Reuní las piezas del set jugando: caen como botín o se reforjan con piezas repetidas. También podés comprar solo esta apariencia con Brasas; no da piezas ni poder.',
    'Collect the set pieces by playing: they drop as loot or are reforged from duplicate pieces. You can also buy just this look with Embers; it gives no pieces or power.',
    'Reúna as peças do set jogando: caem como espólio ou são reforjadas com peças repetidas. Também pode comprar só esta aparência com Brasas; não dá peças nem poder.')
add('Sin cuenta también tenés un pase: el Pase de temporada es gratis y se juega desde Desafíos.',
    'Even without an account you have a pass: the Season pass is free and you play it from Challenges.',
    'Mesmo sem conta você tem um passe: o Passe de temporada é grátis e se joga em Desafios.')
add('Ver el pase gratis','View the free pass','Ver o passe grátis')
add('Los cosméticos premium todavía no tienen el arte final. El pase gratis no cambia.',
    "Premium cosmetics don't have their final art yet. The free pass doesn't change.",
    'Os cosméticos premium ainda não têm a arte final. O passe grátis não muda.')
add('¿Activar la ruta premium por ✦ {n} Brasas? Dura toda la temporada y solo da cosméticos, oro y Brasas (nunca poder). Sus cosméticos todavía no tienen el arte final.',
    "Activate the premium track for ✦ {n} Embers? It lasts the whole season and only gives cosmetics, gold and Embers (never power). Its cosmetics don't have their final art yet.",
    'Ativar a trilha premium por ✦ {n} Brasas? Dura toda a temporada e só dá cosméticos, ouro e Brasas (nunca poder). Seus cosméticos ainda não têm a arte final.')
# solo con BP_PREMIUM_HOLD = true (js/ui/battlepass-ui.js)
add('El pase premium llega más adelante.','The premium pass is coming later.','O passe premium chega mais adiante.')
add('Más adelante','Later','Mais adiante')

# ---------------------------------------------------------------- producto: panel «Lo próximo que desbloqueás» (js/ui/next-unlock.js)
add('Lo próximo que desbloqueás','What you unlock next','O que você desbloqueia a seguir')
add('Pase gratis · nivel 1','Free pass · level 1','Passe grátis · nível 1')
add('Racha diaria','Daily streak','Sequência diária')
add('Cuenta · nivel 1','Account · level 1','Conta · nível 1')
add('Horda Infinita · Sin Cicatriz','Endless Horde · No Scar','Horda Infinita · Sem Cicatriz')
add('Marco Cicatriz V','Scar V frame','Moldura Cicatriz V')
add('Título «Veterano»','Title “Veteran”','Título “Veterano”')
add('Título «Curtido en la Horda»','Title “Hardened by the Horde”','Título “Curtido na Horda”')
add('Título «Leyenda de la Horda»','Title “Legend of the Horde”','Título “Lenda da Horda”')
add('Un guardián a elección','A guardian of your choice','Um guardião à sua escolha')
add('1 / 2 XP','1 / 2 XP','1 / 2 XP')
add('1 / 2 días','1 / 2 days','1 / 2 dias')
add('1 / 2 rondas','1 / 2 rounds','1 / 2 rodadas')
add('1 / 2 de oro','1 / 2 gold','1 / 2 de ouro')
add('Equipar título','Equip title','Equipar título')
add('Equipar marco','Equip frame','Equipar moldura')
add('Ver apariencias','View looks','Ver aparências')

# ---------------------------------------------------------------- plataforma
add('Sin conexión: podés jugar en solitario.','Offline: you can play solo.','Sem conexão: você pode jogar sozinho.')
add('Elegí con 1 2 3 o con clic.','Choose with 1 2 3 or click.','Escolha com 1 2 3 ou com clique.')

# ---------------------------------------------------------------- gameplay: avisos de guardado (gameAlert: un solo nodo con "\n") y Horda
add('Guardado','Save data','Salvamento')
add('No pudimos leer tu guardado.\nNo se borró: quedó una copia de respaldo en este dispositivo.\nEmpezás con un perfil nuevo y el juego lo va a guardar normalmente.',
    "We couldn't read your save.\nIt wasn't deleted: a backup copy was kept on this device.\nYou start with a new profile and the game will save it normally.",
    'Não conseguimos ler seu salvamento.\nEle não foi apagado: ficou uma cópia de segurança neste dispositivo.\nVocê começa com um perfil novo e o jogo vai salvá-lo normalmente.')
add('No pudimos leer tu guardado ni hacerle una copia de respaldo.\nPara no pisarlo, lo que juegues en esta sesión no se va a guardar. Liberá espacio y volvé a abrir el juego.',
    "We couldn't read your save or make a backup copy of it.\nTo avoid overwriting it, what you play this session won't be saved. Free up space and reopen the game.",
    'Não conseguimos ler seu salvamento nem fazer uma cópia de segurança dele.\nPara não sobrescrevê-lo, o que você jogar nesta sessão não será salvo. Libere espaço e abra o jogo de novo.')
add('No se pudo guardar el progreso: el almacenamiento está lleno o bloqueado.\nPodés seguir jugando, pero lo nuevo se puede perder al cerrar. Liberá espacio: el juego vuelve a intentar solo.',
    'Could not save your progress: storage is full or blocked.\nYou can keep playing, but anything new may be lost when you close. Free up space: the game retries on its own.',
    'Não foi possível salvar o progresso: o armazenamento está cheio ou bloqueado.\nVocê pode continuar jogando, mas o que for novo pode se perder ao fechar. Libere espaço: o jogo tenta de novo sozinho.')
add('No se pudo guardar el progreso de esta partida.\nPodés seguir, pero el botín se puede perder al cerrar el juego.',
    "Could not save this match's progress.\nYou can continue, but the loot may be lost when you close the game.",
    'Não foi possível salvar o progresso desta partida.\nVocê pode continuar, mas o espólio pode se perder ao fechar o jogo.')
add('Tu inventario llegó al máximo: lo que no entró quedó en Recompensas pendientes, en el menú principal.',
    "Your inventory is full: what didn't fit went to Pending rewards, in the main menu.",
    'Seu inventário chegou ao máximo: o que não coube ficou em Recompensas pendentes, no menu principal.')
T+=[('No se pudo guardar el progreso de esta partida.\nProbá de nuevo; si sigue fallando, la próxima vez podés seguir sin guardar.',
 'Your progress for this run could not be saved.\nTry again; if it keeps failing, next time you can continue without saving.',
 'Não foi possível salvar o progresso desta partida.\nTente de novo; se continuar falhando, da próxima vez você poderá seguir sem salvar.')]
# --- Opciones › Pantalla (index.html #opt-sec-screen, js/core/fullscreen.js)
T+=[('Pantalla','Screen','Tela'),
 ('Pantalla completa','Fullscreen','Tela cheia'),
 ('También con F11 o Alt+Enter','Also with F11 or Alt+Enter','Também com F11 ou Alt+Enter'),
 ('Alternar','Toggle','Alternar'),
 ('Salir del juego','Quit game','Sair do jogo'),
 ('Cierra el juego y vuelve al escritorio','Closes the game and returns to the desktop','Fecha o jogo e volta para a área de trabalho'),
 ('Salir','Quit','Sair'),
 ('¿Cerrar el juego? Tu progreso ya está guardado.','Close the game? Your progress is already saved.','Fechar o jogo? Seu progresso já está salvo.')]
T+=[('Dispara de lejos y corre rápido. Pega sin acercarse al peligro.','Shoots from afar and runs fast. Hits without getting close to danger.','Atira de longe e corre rápido. Ataca sem se aproximar do perigo.')]
# --- Renglón «▶ qué hacer» del tutorial (js/systems/alpha-training.js: "▶ " + objetivo, un solo nodo de texto)
_OBJ=[('Leé la misión (se sigue sola)','Read the mission (it continues on its own)','Leia a missão (continua sozinha)'),
 ('Movete por la arena','Move around the arena','Mova-se pela arena'),
 ('Derrotá al enemigo con Ataque','Defeat the enemy with Attack','Derrote o inimigo com Ataque'),
 ('Lanzá una habilidad','Cast an ability','Lance uma habilidade'),
 ('Esquivá el golpe marcado','Dodge the marked strike','Desvie do golpe marcado'),
 ('Elegí: JUGAR YA o Seguir practicando','Choose: PLAY NOW or Keep practicing','Escolha: JOGAR AGORA ou Continuar praticando'),
 ('Mantené una habilidad para leer su ficha','Hold an ability to read its card','Segure uma habilidade para ler a ficha dela'),
 ('Volvé a usar la habilidad cuando recargue','Use the ability again when it recharges','Use a habilidade de novo quando recarregar'),
 ('Lanzá tu definitiva','Cast your ultimate','Lance sua definitiva'),
 ('Recogé la poción roja','Pick up the red potion','Pegue a poção vermelha'),
 ('Mantené ✚ junto a Elyra hasta revivirla','Hold ✚ next to Elyra until she is revived','Segure ✚ junto a Elyra até reanimá-la'),
 ('Derrotá al esqueleto y subí de nivel','Defeat the skeleton and level up','Derrote o esqueleto e suba de nível'),
 ('Recogé el objeto','Pick up the item','Pegue o item'),
 ('Abrí el Panel táctico y volvé','Open the Tactical panel and come back','Abra o Painel tático e volte'),
 ('Derrotá a los tres enemigos','Defeat the three enemies','Derrote os três inimigos'),
 ('Mantené el clic sobre una habilidad para leer su ficha','Hold the click on an ability to read its card','Segure o clique em uma habilidade para ler a ficha dela')]
T+=[('▶ '+a,'▶ '+b,'▶ '+c) for a,b,c in _OBJ]
