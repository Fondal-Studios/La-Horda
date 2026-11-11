# -*- coding: utf-8 -*-
# Lote 376: restos visibles de la auditoría profunda (tools/i18n/tour-deep.js): Tienda, pantalla de inicio de partida y avisos.
import re
T=[]
_NUM=re.compile(r'\d+(?:[.,]\d+)*')
def add(es,en,pt):
    n=_NUM.findall(es)
    assert n==_NUM.findall(en)==_NUM.findall(pt), ('orden de números distinto',es,en,pt)
    T.append((_NUM.sub('{n}',es),_NUM.sub('{n}',en),_NUM.sub('{n}',pt)))
add("Comenzar partida","Start game","Começar partida")
add("Color del efecto","Effect color","Cor do efeito")
add("Entrá con tu cuenta para comprar con Brasas.","Sign in with your account to buy with Embers.","Entre com sua conta para comprar com Brasas.")
add("Ya es tuyo · Precio en tienda:","Already yours · Shop price:","Já é seu · Preço na loja:")
add("Tocá uno: es tu regalo para empezar (gratis). Los demás se compran en la Tienda por","Tap one: it's your starting gift (free). The others are bought in the Shop for","Toque em um: é seu presente para começar (grátis). Os outros se compram na Loja por")
add("Para tu guardián actual (","For your current guardian (","Para seu guardião atual (")
add("· Reliquias permanentes:","· Permanent relics:","· Relíquias permanentes:")
add("varias apariencias de un campeón, más baratas juntas · solo apariencia","several looks of one champion, cheaper together · appearance only","várias aparências de um campeão, mais baratas juntas · só aparência")
add("Skin · colección Corazón del Coloso · solo apariencia · universal","Skin · Heart of the Colossus collection · appearance only · universal","Skin · coleção Coração do Colosso · só aparência · universal")
add("Título «Constante»","Title «Constant»","Título «Constante»")
add("Golpe Devastador: +5% daño crítico","Devastating Blow: +5% critical damage","Golpe Devastador: +5% de dano crítico")
add("Gracia Curativa: +5% curación","Healing Grace: +5% healing","Graça Curativa: +5% de cura")
add("Ojo Certero: +5% prob. de crítico","Keen Eye: +5% crit chance","Olho Certeiro: +5% de chance de crítico")
add("◇ +5% resistencia física","◇ +5% physical resistance","◇ +5% de resistência física")
add("Tu horda sale sola por tres carriles. Derribá torres; con una inhibidora caída, el cristal queda expuesto.","Your horde marches out by itself along three lanes. Take down towers; once an inhibitor falls, the crystal is exposed.","Sua horda sai sozinha por três corredores. Derrube torres; com um inibidor caído, o cristal fica exposto.")
add("Vencé héroes rivales para ganar oro. Eclipse a los 6 min; a los 12 gana quien tenga más torres y vida.","Defeat rival heroes to earn gold. Eclipse at 6 min; at 12, whoever has more towers and health wins.","Derrote heróis rivais para ganhar ouro. Eclipse aos 6 min; aos 12 vence quem tiver mais torres e vida.")
add("para apariencias","for looks","para aparências")
add("(500 + 400 de regalo) para apariencias, todo por US$ 6,99. Se compra una sola vez por cuenta. Las Brasas solo compran apariencias (nunca poder); los campeones se consiguen jugando, con oro.","(500 + 400 bonus) for looks, all for US$ 6,99. Bought once per account. Embers only buy looks (never power); champions are earned by playing, with gold.","(500 + 400 de brinde) para aparências, tudo por US$ 6,99. Compra única por conta. As Brasas só compram aparências (nunca poder); os campeões se conseguem jogando, com ouro.")
