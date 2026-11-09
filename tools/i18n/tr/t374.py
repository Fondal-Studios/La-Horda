# -*- coding: utf-8 -*-
# Rangos de Cicatriz (js/data/scar-ranks.js, js/systems/scar-ranks.js) y textos nuevos de la Horda. Las cifras van como {n}.
T=[]
R=['I','II','III','IV','V']
names_en=['Scar '+r for r in R]; names_pt=['Cicatriz '+r for r in R]
names_es=['Cicatriz '+r for r in R]
T+=[
('Rango de Cicatriz:','Scar Rank:','Nível de Cicatriz:'),
('Sin Cicatriz','No Scar','Sem Cicatriz'),
('La Horda de siempre.','The usual Horde.','A Horda de sempre.'),
('El doble de élites con rol.','Double the role elites.','O dobro de elites com função.'),
('Élites dobles y enemigos más rápidos.','Double elites and faster enemies.','Elites duplas e inimigos mais rápidos.'),
('Suma jefes furiosos (+{n}% vida, +{n}% daño).','Adds enraged bosses (+{n}% health, +{n}% damage).','Soma chefes furiosos (+{n}% de vida, +{n}% de dano).'),
('Suma rondas cortas y densas: no hay respiro.','Adds short, dense rounds: no breathing room.','Soma rodadas curtas e densas: sem folga.'),
('Sin pociones de vida. La curación es tuya.','No health potions. Healing is on you.','Sem poções de vida. A cura fica por sua conta.'),
('Puntaje ×{n}','Score ×{n}','Pontuação ×{n}'),
('(lo elige el anfitrión)','(chosen by the host)','(escolhido pelo anfitrião)'),
('Llegá a la ronda {n} para el marco Cicatriz.','Reach round {n} for the Scar frame.','Chegue à rodada {n} para a moldura Cicatriz.'),
('Marco Cicatriz','Scar frame','Moldura Cicatriz'),
('Cicatriz','Scar','Cicatriz'),
('HORDA INFINITA · TEMPORADA {n}/{n}','ENDLESS HORDE · SEASON {n}/{n}','HORDA INFINITA · TEMPORADA {n}/{n}'),
('Temporada {n}/{n}','Season {n}/{n}','Temporada {n}/{n}'),
('Marcado por la Cicatriz','Marked by the Scar','Marcado pela Cicatriz'),
('Cicatriz Viva','Living Scar','Cicatriz Viva'),
('Rompe-Jefes','Boss-Breaker','Quebra-Chefes'),
('Sin Respiro','No Respite','Sem Folga'),
('Hijo de la Cicatriz','Child of the Scar','Filho da Cicatriz'),
]
for i,r in enumerate(R):
    T+=[(names_es[i],names_en[i],names_pt[i]),
        ('Horda Infinita · '+names_es[i],'Endless Horde · '+names_en[i],'Horda Infinita · '+names_pt[i]),
        ('¡'+names_es[i]+' completada!',names_en[i]+' complete!',names_pt[i]+' concluída!'),
        ('¡Se abrió '+names_es[i]+'!',names_en[i]+' unlocked!',names_pt[i]+' desbloqueada!'),
        ('Llegá a la ronda {n} para abrir '+names_es[i]+'.','Reach round {n} to unlock '+names_en[i]+'.','Chegue à rodada {n} para abrir '+names_pt[i]+'.'),
        ('Te faltaron {n} rondas para '+names_es[i],'You were {n} rounds short of '+names_en[i],'Faltaram {n} rodadas para '+names_pt[i]),
        ('Te faltaron {n} ronda para '+names_es[i],'You were {n} round short of '+names_en[i],'Faltou {n} rodada para '+names_pt[i]),
        ('Título «'+['Marcado por la Cicatriz','Cicatriz Viva','Rompe-Jefes','Sin Respiro','Hijo de la Cicatriz'][i]+'»',
         'Title “'+['Marked by the Scar','Living Scar','Boss-Breaker','No Respite','Child of the Scar'][i]+'”',
         'Título “'+['Marcado pela Cicatriz','Cicatriz Viva','Quebra-Chefes','Sem Folga','Filho da Cicatriz'][i]+'”')]
T+=[('Te faltaron {n} rondas para el marco Cicatriz','You were {n} rounds short of the Scar frame','Faltaram {n} rodadas para a moldura Cicatriz'),
    ('Te faltaron {n} ronda para el marco Cicatriz','You were {n} round short of the Scar frame','Faltou {n} rodada para a moldura Cicatriz')]
