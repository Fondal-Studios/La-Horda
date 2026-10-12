'use strict';
// Registro de producción de los cinco campeones nuevos (Solciju, Veyra, Brakk, Morveth, Aelith).
// Va DESPUÉS de sus kits y ANTES de js/systems/champion-entry-balance.js, que normaliza sus estadísticas iniciales.
// Ninguno está en knownChampions: siguen siendo candidatos hasta cerrar el segundo paso de AGENTS.md.
// Arte: atlas instalados con tools/art/painter/install.py (js/champions/ascension/art.js); skins en js/assets/quality-five-skins-meta.js.
{
 const k='solciju',base='mago';
 CLASSES[k]={...CLASSES[base],name:'Solciju',hudName:'Solciju',role:'Maga de control',roleCategory:'mago',color:'#923951',glow:'#923951',baseHP:98,baseDmg:10,baseDef:.07,baseSpeed:157,basicRange:300,basicCd:560,hpGrowthMult:.8,dmgGrowthMult:1.0,skills:SOLCIJU_KIT.slice(0,3),ultimate:SOLCIJU_KIT[3],passive:{name:'Fermentación',ico:'◇',desc:'Básicos y vino añaden hasta tres marcas por objetivo durante 5 s. El siguiente impacto de vino las consume para infligir 25% más daño y ralentizar.'}};
 PORTADORES[k]={...CLASSES[k],title:'La Enóloga',set:'quality_solciju',branches:['Fermentación','Barricas','Brindis'],history:'Solciju conservaba las últimas cosechas de una ciudad que ya nadie recordaba. Cuando la peste alcanzó sus bodegas, descubrió que el vino retenía algo más que años: atrapaba las maldiciones de quienes lo bebían. Ahora recorre las ruinas con una reserva que jamás ofrece por cortesía. Dice detestar la compañía, pero siempre guarda una copa para quien sobreviva a su lado.'};
 CHAMPION_CATALOG.push({id:k,priceGold:CHAMPION_PRICE_GOLD,unlockedByDefault:false,lore:PORTADORES[k].history});
 save.champions[k] ||= mkChampion(false);CLASS_WEAPON_LABEL[k]='Copa maldita';SCORE_CONFIG[k]=SCORE_CONFIG[base];CHAMP_ITEM_AFFINITY[k]={...CHAMP_ITEM_AFFINITY[base]};
 PAL[k]={...PAL[base]};GRIDS[k]=GRIDS[base];ANIM_PROFILES[k]={...ANIM_PROFILES[base]};CHAMP_IDENTITY[k]={sig:'mark',proj:'exglyph'};
 CODEX_CHAMP_LORE[k]={origin:'ciudad',history:PORTADORES[k].history};HERO_VOICES[k]={pick:'No pienso brindar por ustedes.',win:'Al menos no arruinaron la cosecha.',fall:'Qué mal año.'};
 CODEX_SKILL_FX[k]=SOLCIJU_KIT.map(()=>({color:[146,57,81],fx:'zone'}));
 const tree={masteryRequirement:8,nodes:[],masteries:{}};
 const specs=[['Fermentación','lees','Poso maldito','Vino maldito deja dos pulsos de daño durante 2 s.'],['Barricas','cellar','Bodega protectora','Al estallar, las barricas otorgan armadura a aliados cercanos.'],['Brindis','hospitality','Hospitalidad improbable','Brindis también cura y protege a aliados cercanos.']];
 specs.forEach(([name,flag,title,desc],b)=>{
   const branch=k+'_'+b,prefix=k+'_t'+b;
   for(let i=0;i<2;i++)tree.nodes.push({id:prefix+i,branch,type:'common',maxRank:4,cost:1,requires:i?prefix+'0':null,name:name+' · '+(i?'Alcance':'Técnica'),desc:'+3% por rango.',rankDesc:r=>'+'+r*3+'%',mods:r=>[{targetSkill:b,key:i?'areaMult':'durationMult',value:.03*r}]});
   tree.nodes.push({id:prefix+'transform',branch,type:'special',maxRank:1,cost:3,requires:prefix+'1',name:title,desc,rankDesc:()=>desc,mods:()=>[{targetSkill:b,flag}]});
   const [masterFlag,masterName,masterDesc]=[
     ['concentrate','Reserva concentrada','Gran Reserva añade una marca adicional por pulso.'],
     ['cellarRelease','Abrir la bodega','Gran Reserva detona inmediatamente tus barricas dentro del área.'],
     ['reserveHeal','Reserva reparadora','Cada pulso de Gran Reserva cura 1% de vida a los aliados en su área.']
   ][b];
   tree.masteries[branch]={id:branch,branch,name:name+' · Gran maestría',desc:'Decisión permanente desde nivel 90. Abre una transformación de Gran Reserva.',miniTree:[{id:prefix+'master',maxRank:1,cost:4,name:masterName,desc:masterDesc,rankDesc:()=>masterDesc,mods:()=>[{targetSkill:'ult',flag:masterFlag}]}]};
 });
 // 33 ordinary points required; the level-99 budget is 30.
 TALENT_TREES[k]=tree;
 
}
{
 const k='veyra',base='guerrero';
 CLASSES[k]={...CLASSES[base],name:'Veyra',hudName:'Veyra',role:'Asesina de riesgo',roleCategory:'asesino',color:'#ab3459',glow:'#ab3459',baseHP:95,baseDmg:11,baseDef:.06,baseSpeed:178,basicRange:70,basicCd:450,hpGrowthMult:.8,dmgGrowthMult:1,skills:VEYRA_KIT.slice(0,3),ultimate:VEYRA_KIT[3],passive:{name:'Al filo',ico:'◇',desc:'Sus habilidades y sangrados infligen 15% más daño cuando tiene menos de 40% de vida.'}};
 PORTADORES[k]={...CLASSES[k],title:'La Última Herida',set:'quality_veyra',branches:['Herida','Paso','Pacto'],history:'Veyra regresó del campo de batalla con una herida que ningún sanador logró cerrar. Aprendió a escuchar su pulso y a moverse en el silencio entre dos latidos. No busca una muerte gloriosa: persigue a quienes comercian con la vida de otros. Cada pacto con su propia sangre le concede un instante de ventaja y le recuerda que sobrevivir también puede ser una forma de venganza.'};
 CHAMPION_CATALOG.push({id:k,priceGold:CHAMPION_PRICE_GOLD,unlockedByDefault:false,lore:PORTADORES[k].history});
 save.champions[k] ||= mkChampion(false);CLASS_WEAPON_LABEL[k]='Hojas de sangría';SCORE_CONFIG[k]=SCORE_CONFIG[base];CHAMP_ITEM_AFFINITY[k]={...CHAMP_ITEM_AFFINITY[base]};
 PAL[k]={...PAL[base]};GRIDS[k]=GRIDS[base];ANIM_PROFILES[k]={...ANIM_PROFILES[base]};CHAMP_IDENTITY[k]={sig:'mark',proj:'exglyph'};
 CODEX_CHAMP_LORE[k]={origin:'ciudad',history:PORTADORES[k].history};HERO_VOICES[k]={pick:'Todavía late.',win:'Hoy no fue la última.',fall:'Un latido más.'};CODEX_SKILL_FX[k]=VEYRA_KIT.map(()=>({color:[171,52,89],fx:'zone'}));
 const tree={masteryRequirement:8,nodes:[],masteries:{}};
 [['lance','Incisión recta','El corte se convierte en una línea penetrante.'],['escape','Paso protegido','El desplazamiento otorga 15% de armadura por 1,5 s.'],['cleanse','Romper ataduras','Pacto elimina la ralentización actual.']].forEach(([flag,name,desc],b)=>{
  const branch=k+'_'+b,prefix=k+'_t'+b;
  for(let i=0;i<2;i++)tree.nodes.push({id:prefix+i,branch,type:'common',maxRank:4,cost:1,requires:i?prefix+'0':null,name:PORTADORES[k].branches[b]+' · '+(i?'Disciplina':'Técnica'),desc:'+3% por rango',rankDesc:r=>'+'+r*3+'%',mods:r=>[{targetSkill:b,key:i?'durationMult':'areaMult',value:.03*r}]});
  tree.nodes.push({id:prefix+'transform',branch,type:'special',maxRank:1,cost:3,requires:prefix+'1',name,desc,rankDesc:()=>desc,mods:()=>[{targetSkill:b,flag}]});
  const [mf,mn,md]=[
   ['reopen','Cicatriz abierta','La definitiva reaplica un sangrado ligero a las heridas que consume.'],
   ['lastEscape','Último paso','La definitiva otorga 20% de velocidad durante 1,8 s.'],
   ['bloodShield','Sangre coagulada','La definitiva convierte heridas consumidas en escudo, hasta 12% de vida.']
  ][b];
  tree.masteries[branch]={id:branch,branch,name:mn,desc:md,miniTree:[{id:prefix+'master',maxRank:1,cost:4,name:mn,desc:md,rankDesc:()=>md,mods:()=>[{targetSkill:'ult',flag:mf}]}]};
 });
 TALENT_TREES[k]=tree;
}
{
 const k='brakk',base='tanque';
 CLASSES[k]={...CLASSES[base],name:'Brakk',hudName:'Brakk',role:'Tanque constructor',roleCategory:'tanque',color:'#cead7a',glow:'#cead7a',baseHP:165,baseDmg:9,baseDef:.19,baseSpeed:140,basicRange:75,basicCd:650,hpGrowthMult:1.4,dmgGrowthMult:.8,skills:BRAKK_KIT.slice(0,3),ultimate:BRAKK_KIT[3],passive:{name:'Cimientos firmes',ico:'◇',desc:'Recibe 8% menos daño mientras permanece a 120 unidades de una construcción propia.'}};
 PORTADORES[k]={...CLASSES[k],title:'El Arquitecto del Fin',set:'quality_brakk',branches:['Muralla','Asedio','Refugio'],history:'Brakk calculó durante años las murallas de una ciudad que sus gobernantes decidieron abandonar. Cuando llegó la Horda, convirtió los planos de evacuación en fortificaciones y abrió rutas entre los derrumbes. Desde entonces construye refugios que sabe temporales: cada torre compra segundos y cada muro guarda una salida. Carga los nombres de quienes no logró salvar grabados en su martillo.'};
 CHAMPION_CATALOG.push({id:k,priceGold:CHAMPION_PRICE_GOLD,unlockedByDefault:false,lore:PORTADORES[k].history});
 save.champions[k] ||= mkChampion(false);CLASS_WEAPON_LABEL[k]='Martillo de obra';SCORE_CONFIG[k]=SCORE_CONFIG[base];CHAMP_ITEM_AFFINITY[k]={...CHAMP_ITEM_AFFINITY[base]};
 PAL[k]={...PAL[base]};GRIDS[k]=GRIDS[base];ANIM_PROFILES[k]={...ANIM_PROFILES[base]};CHAMP_IDENTITY[k]={sig:'mark',proj:'exglyph'};
 CODEX_CHAMP_LORE[k]={origin:'ciudad',history:PORTADORES[k].history};HERO_VOICES[k]={pick:'Primero, una salida.',win:'La estructura resistió.',fall:'Evacúen… ahora.'};CODEX_SKILL_FX[k]=BRAKK_KIT.map(()=>({color:[206,173,122],fx:'zone'}));
 const tree={masteryRequirement:8,nodes:[],masteries:{}};
 [['gate','Muralla ancha','El muro gana 25% de longitud pero pierde 35% de duración.'],['pierce','Clavos penetrantes','La torreta dispara en línea y atraviesa hasta doce objetivos.'],['crew','Cuadrilla protegida','Apuntalar también protege a aliados cercanos.']].forEach(([flag,name,desc],b)=>{
  const branch=k+'_'+b,prefix=k+'_t'+b;
  for(let i=0;i<2;i++)tree.nodes.push({id:prefix+i,branch,type:'common',maxRank:4,cost:1,requires:i?prefix+'0':null,name:PORTADORES[k].branches[b]+' · '+(i?'Disciplina':'Técnica'),desc:'+3% por rango',rankDesc:r=>'+'+r*3+'%',mods:r=>[{targetSkill:b,key:i?'durationMult':'areaMult',value:.03*r}]});
  tree.nodes.push({id:prefix+'transform',branch,type:'special',maxRank:1,cost:3,requires:prefix+'1',name,desc,rankDesc:()=>desc,mods:()=>[{targetSkill:b,flag}]});
  const [mf,mn,md]=[['rubble','Campo de escombros','Demolición prolonga 1,2 s la ralentización.'],['renew','Obra de emergencia','Apuntalar recupera 2,5% de vida máxima.'],['bastion','Último refugio','Demolición también escuda a aliados por 6% de su vida.']][b];
  tree.masteries[branch]={id:branch,branch,name:mn,desc:md,miniTree:[{id:prefix+'master',maxRank:1,cost:4,name:mn,desc:md,rankDesc:()=>md,mods:()=>[{targetSkill:'ult',flag:mf}]}]};
 });TALENT_TREES[k]=tree;
}
{
 const k='morveth',base='mago';
 CLASSES[k]={...CLASSES[base],...{"name": "Morveth", "hudName": "Morveth", "role": "Mago invocador", "roleCategory": "mago", "color": "#a4c56a", "glow": "#a4c56a", "baseHP": 96, "baseDmg": 8.5, "baseDef": 0.07, "baseSpeed": 152, "basicRange": 300, "basicCd": 600, "hpGrowthMult": 0.75, "dmgGrowthMult": 1.1, "passive": {"name": "Contagio terminal", "ico": "◷", "desc": "Cuando muere un enemigo infectado contagia hasta tres vecinos. Los contagios secundarios no vuelven a propagarse."}},skills:MORVETH_KIT.slice(0,3),ultimate:MORVETH_KIT[3]};
 PORTADORES[k]={...CLASSES[k],...{"title": "El Jardinero de la Peste", "set": "quality_morveth", "branches": ["Huerto", "Contagio", "Simbiosis"], "history": "Morveth cuidaba el jardín de un hospital sitiado. Cuando las medicinas se agotaron, descubrió un micelio capaz de retener la infección en sus raíces. Ahora transporta aquel cultivo en una urna agrietada. Sus hongos necesitan tiempo y terreno para extenderse; arrancarlos deja al jardinero expuesto. No busca una cura perfecta, sino impedir que la próxima cosecha sean los vivos."}};
 CHAMPION_CATALOG.push({id:k,priceGold:CHAMPION_PRICE_GOLD,unlockedByDefault:false,lore:PORTADORES[k].history});
 save.champions[k] ||= mkChampion(false);CLASS_WEAPON_LABEL[k]='Urna de cultivo';SCORE_CONFIG[k]=SCORE_CONFIG[base];CHAMP_ITEM_AFFINITY[k]={...CHAMP_ITEM_AFFINITY[base]};
 PAL[k]={...PAL[base]};GRIDS[k]=GRIDS[base];ANIM_PROFILES[k]={...ANIM_PROFILES[base]};CHAMP_IDENTITY[k]={sig:'mark',proj:'exglyph'};
 CODEX_CHAMP_LORE[k]={origin:'ciudad',history:PORTADORES[k].history};HERO_VOICES[k]={pick:'La tierra recuerda.',win:'Todavía hay vida.',fall:'Otra estación…'};CODEX_SKILL_FX[k]=MORVETH_KIT.map(()=>({color:[164,197,106],fx:'zone'}));
 const tree={masteryRequirement:8,nodes:[],masteries:{}};
 [["roots", "Raíces febriles", "Los pulsos del hongo ralentizan 20% durante 0,8 s."], ["choke", "Esporas asfixiantes", "Exhalación también ralentiza 25% durante 1,5 s."], ["share", "Red simbiótica", "Simbiosis también cura y protege aliados cercanos."]].forEach(([flag,name,desc],b)=>{
  const branch=k+'_'+b,prefix=k+'_t'+b;
  for(let i=0;i<2;i++)tree.nodes.push({id:prefix+i,branch,type:'common',maxRank:4,cost:1,requires:i?prefix+'0':null,name:PORTADORES[k].branches[b]+' · '+(i?'Disciplina':'Técnica'),desc:'+3% por rango',rankDesc:r=>'+'+r*3+'%',mods:r=>[{targetSkill:b,key:i?'durationMult':'areaMult',value:.03*r}]});
  tree.nodes.push({id:prefix+'transform',branch,type:'special',maxRank:1,cost:3,requires:prefix+'1',name,desc,rankDesc:()=>desc,mods:()=>[{targetSkill:b,flag}]});
  const [mf,mn,md]=[["harvest", "Cosecha final", "El jardín consume hongos cercanos para infligir una explosión por hongo."], ["renew", "Vida entre ruinas", "Cada pulso del jardín sana 1% de vida a aliados."], ["shelter", "Micelio protector", "Cada pulso del jardín escuda aliados por 4% de vida."]][b];
  tree.masteries[branch]={id:branch,branch,name:mn,desc:md,miniTree:[{id:prefix+'master',maxRank:1,cost:4,name:mn,desc:md,rankDesc:()=>md,mods:()=>[{targetSkill:'ult',flag:mf}]}]};
 });TALENT_TREES[k]=tree;
}
{
 const k='aelith',base='mago';
 CLASSES[k]={...CLASSES[base],...{"name": "Aelith", "hudName": "Aelith", "role": "Maga temporal", "roleCategory": "mago", "color": "#bfa7dc", "glow": "#bfa7dc", "baseHP": 98, "baseDmg": 10, "baseDef": 0.07, "baseSpeed": 158, "basicRange": 300, "basicCd": 560, "hpGrowthMult": 0.75, "dmgGrowthMult": 1.1, "passive": {"name": "Segundos hurtados", "ico": "◷", "desc": "Cada tercer lanzamiento reduce 0,5 s las otras habilidades activas, sin bajar de 1 s ni alterar la definitiva."}},skills:AELITH_KIT.slice(0,3),ultimate:AELITH_KIT[3]};
 PORTADORES[k]={...CLASSES[k],...{"title": "La Ladrona de Segundos", "set": "quality_aelith", "branches": ["Ecos", "Fractura", "Préstamo"], "history": "Aelith reparaba relojes en una estación donde ningún tren volvía a tiempo. Tras la llegada de la Horda descubrió que los instantes perdidos seguían allí, suspendidos entre los dientes de los engranajes. Aprendió a soltarlos en ecos breves, incapaz de cambiar lo ocurrido. Cada aceleración exige una pausa después: roba segundos a su propio futuro, nunca una vida entera al pasado."}};
 CHAMPION_CATALOG.push({id:k,priceGold:CHAMPION_PRICE_GOLD,unlockedByDefault:false,lore:PORTADORES[k].history});
 save.champions[k] ||= mkChampion(false);CLASS_WEAPON_LABEL[k]='Reloj de bolsillo';SCORE_CONFIG[k]=SCORE_CONFIG[base];CHAMP_ITEM_AFFINITY[k]={...CHAMP_ITEM_AFFINITY[base]};
 PAL[k]={...PAL[base]};GRIDS[k]=GRIDS[base];ANIM_PROFILES[k]={...ANIM_PROFILES[base]};CHAMP_IDENTITY[k]={sig:'mark',proj:'exglyph'};
 CODEX_CHAMP_LORE[k]={origin:'ciudad',history:PORTADORES[k].history};HERO_VOICES[k]={pick:'Tengo un segundo.',win:'Justo a tiempo.',fall:'Se acabó…'};CODEX_SKILL_FX[k]=AELITH_KIT.map(()=>({color:[191,167,220],fx:'zone'}));
 const tree={masteryRequirement:8,nodes:[],masteries:{}};
 [["delayed", "Eco suspendido", "El eco tarda el doble y ralentiza 30% durante 1,4 s."], ["aftershock", "Segundo impacto", "Fractura deja un eco de 20% del daño en el extremo de la línea."], ["share", "Préstamo colectivo", "Comparte aceleración y deuda temporal con aliados cercanos."]].forEach(([flag,name,desc],b)=>{
  const branch=k+'_'+b,prefix=k+'_t'+b;
  for(let i=0;i<2;i++)tree.nodes.push({id:prefix+i,branch,type:'common',maxRank:4,cost:1,requires:i?prefix+'0':null,name:PORTADORES[k].branches[b]+' · '+(i?'Disciplina':'Técnica'),desc:'+3% por rango',rankDesc:r=>'+'+r*3+'%',mods:r=>[{targetSkill:b,key:i?'durationMult':'areaMult',value:.03*r}]});
  tree.nodes.push({id:prefix+'transform',branch,type:'special',maxRank:1,cost:3,requires:prefix+'1',name,desc,rankDesc:()=>desc,mods:()=>[{targetSkill:b,flag}]});
  const [mf,mn,md]=[["reprise", "Instante recuperado", "La definitiva repite una vez el último eco de Instante roto."], ["renew", "Tiempo de sanar", "Cada pulso de la definitiva sana 1% de vida a aliados."], ["haste", "Hora compartida", "Los pulsos de la definitiva aceleran 15% a aliados."]][b];
  tree.masteries[branch]={id:branch,branch,name:mn,desc:md,miniTree:[{id:prefix+'master',maxRank:1,cost:4,name:mn,desc:md,rankDesc:()=>md,mods:()=>[{targetSkill:'ult',flag:mf}]}]};
 });TALENT_TREES[k]=tree;
}
