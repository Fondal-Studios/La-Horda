#!/usr/bin/env node
'use strict';
// Construye los manifiestos del Champion Factory (tools/factory/contracts.js) de los siete campeones nuevos a partir de los
// datos reales del kit y los valida. NUNCA fabrica aprobaciones: la revisión visual humana, el audio auditivo, la croma y el
// Set con arte propio quedan vacíos y el resultado esperado es INCOMPLETE, jamás un STRUCTURAL_PASS inventado.
// Uso: node tools/siete/manifests.js   -> docs/production/siete/<id>.json + validation.json
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {validate,scaffold,taxonomy}=require('../factory/contracts');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/production/siete');
const c={};vm.createContext(c);vm.runInContext('var ASCENSION={};'+fs.readFileSync(path.join(ROOT,'js/champions/siete/catalog.js'),'utf8').replace(/^'use strict';/,'')+';this.SIETE=SIETE;',c);
const PH={ost_beam:['Telescopio apunta y el haz se carga','Haz sostenido que gira con el apuntado','Daño por pulso con Foco creciente','Línea de luz con destello final'],
 gre_snare:['Premarcado de punto y placa tenue','Cepo oculto que se arma en 0,5 s','Salta al pisarlo: daño, casi inmovilidad y Presa','Placa con púas y anillo de disparo'],
 ils_parry:['Florete bajo y anillo de guardia','Ventana de 0,9 s que desvía golpes','Daño recibido 0 y respuesta al atacante','¡RÉPLICA! y chispa de acero'],
 vor_shift:['Muda de piel con onda','Cambio Piedra/Tormenta','Onda que frena o debilita y potencia','Aro de forma y etiqueta de forma'],
 ner_moss:['Premarcado de charco','Charco 7 s que pulsa','Cura aliados, daña y frena enemigos','Disco verde con juncos'],
 qui_deal:['Premarcado en abanico','Tres cartas con el palo que toca','Daño, freno, cura o potencia según palo','Naipes con símbolo de palo'],
 kor_ram:['Premarcado de carrera','Carrera arrastrando comunes','Colisión entre arrastrados y vecinos','Estela de polvo']};
const ids=Object.keys(c.SIETE),results={};fs.mkdirSync(OUT,{recursive:true});
const inst=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/art-gate/painter-installs.json'),'utf8'));
const stylePass=src=>{try{const g=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/art-gate/style-gate.json'),'utf8'));return !!(g.sheets&&g.sheets[src]&&g.sheets[src].pass);}catch(e){return false;}};
const exists=f=>fs.existsSync(path.join(ROOT,f))?f:'';
for(const id of ids){
 const p=c.SIETE[id],meta=taxonomy().meta(id),category=meta.category,m=scaffold(id,category);
 Object.assign(m,{name:p.name,title:p.title,role:p.role,fantasy:p.fantasy,lore:p.history,personality:p.voices.join(' / '),silhouette:p.silhouette,stats:{hp:p.stats[0],damage:p.stats[1],speed:p.stats[3]}});
 const ab=(s,i)=>{const [name,action,cost,cd,range,radius,duration,dmg,desc]=s,ph=PH[action]||['Pose de cast y telegraph','Ejecución de '+name,desc,'Impacto propio y número de daño'];
  return {id:action,description:desc,cooldownMs:cd,maxTargets:i===3?60:24,hordeMechanism:(radius>=60||/línea|fila|abanico|zona|zonas|trampas|atraviesa|arrastr|rodean|alrededor/i.test(desc))?'Área/línea con límite de objetivos (24) y techo por lanzamiento contra jefes':'',anticipation:ph[0],execution:ph[1],impact:ph[2],feedback:ph[3],vfx:'js/champions/siete/render.js',sfx:'si_'+id+(i===3?'_ult':'_cast')};};
 m.kit={basic:{id:'basic',description:p.stats[6]?'Básico a distancia':'Básico cuerpo a cuerpo',cooldownMs:p.stats[5],maxTargets:1,hordeMechanism:'',anticipation:'Pose de ataque',execution:'Golpe básico',impact:'Daño único',feedback:'Número de daño',vfx:'existing basic VFX',sfx:'hit'},skills:p.skills.slice(0,3).map(ab),ultimate:ab(p.skills[3],3)};
 m.integration={runtime:'js/champions/siete/'+id+'.js',codex:'js/champions/siete/catalog.js',talents:'js/champions/siete/register.js',mastery:'js/champions/ascension/register.js',set:'js/champions/ascension/register.js',kitTest:'tools/siete/functional.js'};
 const dir='assets/sprites/champions/'+id,f=path.join(ROOT,dir,'atlas.png');
 if(fs.existsSync(f))Object.assign(m.art,{atlas:dir+'/atlas.png',preview:dir+'/preview.png',directions:4,frameWidth:112,frameHeight:112,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),animations:{idle:1,walk:4,attack:4,cast:4,hit:1,death:4,ultimate:4}});
 m.cosmetics=p.skins.map(([name,visualTheme,lore],i)=>({id:id+'_alt'+(i+1),type:'skin',champion:id,name,rarity:'Épica',tagline:visualTheme,lore,visualTheme,unlockSource:'alpha-test',collection:'Siete (TESTING)',vfxProfile:'js/champions/siete/render.js',visualChanges:['accessory','secondarySilhouette'],preview:'assets/sprites/champions/'+id+'/skins/'+id+'_alt'+(i+1)+'/preview.png',availability:'alpha-test',premiumPrice:null}));
 m.set={sourceArena:p.arena,pieces:['arma','casco','pechera','botas'],rewardCosmetic:'',rewardGrantsPower:false};
 m.budgets={particles:64,summons:({grelk:6,nerith:5,quillon:1,ostrel:2,vorn:1,kora:0,ilsa:0})[id],audioVoices:3};
 m.art.review={status:'PENDING',reviewer:'',evidence:'',note:'Hoja del Pintor (donantes + forja) con gate de estilo y Roster Art Gate en PASS; requiere revisión humana del Visual Gate (docs/ART_BIBLE.md §8). Filas de muerte con rasgos del donante.'};
 m.evidence={reference:exists('docs/balance/champion-entry-reference.json'),balance:exists('docs/balance/entry-gate-results.json'),visuals:exists('docs/art-gate/roster-gate.json'),audio:'',multiplayer:exists('docs/production/siete/functional-results.json'),performance:'',style:stylePass('assets/sprites/champions/'+id+'/atlas.png')?exists('docs/art-gate/style-gate.json'):''};
 const errors=validate(m);results[id]={category,releaseState:meta.releaseState,status:errors.length?'INCOMPLETE':'STRUCTURAL_PASS',errors};
 fs.writeFileSync(path.join(OUT,id+'.json'),JSON.stringify(m,null,2)+'\n');
}
fs.writeFileSync(path.join(OUT,'validation.json'),JSON.stringify({note:'INCOMPLETE es lo esperado hasta la revisión humana de arte/audio, croma y Set con arte propio, rendimiento medido en dispositivo y multijugador real. Los manifiestos nunca se registran solos.',results},null,2)+'\n');
for(const [id,r] of Object.entries(results))console.log(id.padEnd(8),r.status,'·',r.errors.length,'pendientes:',r.errors.join(' | ').slice(0,260));
