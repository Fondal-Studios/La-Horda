'use strict';
// Persistent economy UI: all mutations go through the account ledger.
(function(){
 let root=null,body=null,status=null,tab='Inventario',previous=null;
 const tabs=['Inventario','Forja','Subastas','Colección','Reliquias','Temporada'];
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function button(parent,label,fn){const b=el('button',label,'btn small');b.type='button';b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){say(e.message);}finally{b.disabled=false;}};parent.append(b);return b;}
 function say(s){if(status)status.textContent=s;}
 function field(parent,label,value,type='text'){const l=el('label',undefined,'eco-field'),i=el('input');i.type=type;i.value=value;l.append(el('span',label),i);parent.append(l);return i;}
 function select(parent,label,options){const l=el('label',undefined,'eco-field'),i=el('select');for(const [v,t] of options){const o=el('option',t);o.value=v;i.append(o);}l.append(el('span',label),i);parent.append(l);return i;}
 function card(title,desc){const c=el('section',undefined,'eco-card');c.append(el('h3',title));if(desc)c.append(el('p',desc));body.append(c);return c;}
 function close(){root?.remove();root=null;previous?.focus();}
 async function act(op,args){say('Guardando…');const r=await economyAction(op,args);draw();say(r.success===false?'El intento falló. Tu objeto conserva todas sus mejoras.':'Guardado en tu cuenta.');return r;}
 function itemLabel(it){return `${it.name} · ${RARITY_META[it.rarity]?.label||it.rarity} · ${ITEM_TYPES[it.type]?.label||it.type} · Nv. ${it.level}`;}
 function describe(it){return `Valor base: ${Number(it.value).toFixed(3)}. ${it.affixes?.map(x=>(AFFIX_DB[x.id]?.adj||AFFIX_DB[x.id]?.suf||x.id)+' '+Math.round(x.v*100)+'%').join(' · ')||''}${it.creator?' · Creado por '+it.creator:''}${it.legacy?' · Pieza anterior: conservada, fuera del mercado.':''}`;}
 function draw(){
  if(!root)return;body.replaceChildren();const d=ECON.data,a=d?.account;
  root.querySelectorAll('[data-eco-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.ecoTab===tab)));
  if(!economyActive()){card('Economía de cuenta','Iniciá sesión y conectate al servidor para acceder a inventario persistente, forja y subastas.');button(body,'Abrir cuenta',()=>window.accountOpen?.());return;}
  const summary=el('p',`${a.gold.toLocaleString('es-AR')} oro · ${a.materials} materiales · ${d.ranks[a.rank]} · ${a.xp} XP de forja`,'eco-summary');body.append(summary);
  for(const n of (a.notices||[]).slice(-3))body.append(el('p',n.text,'eco-warning'));
  if(d.warning)body.append(el('p',d.warning,'eco-warning'));
  if(ECON.run)body.append(el('p','Hay una partida abierta. Finalizala antes de cambiar equipo o fabricar.'));
  if(tab==='Inventario'){
   const c=card('Botín automático','Los materiales no ocupan espacios. Solo se fusionan duplicados idénticos; los favoritos y el equipo valioso quedan protegidos. El excedente se conserva.');
   const cfg=a.autoLoot||{enabled:true,fuse:true,recycle:false},inputs={};
   for(const [k,label] of [['enabled','Gestión automática'],['fuse','Fusionar duplicados idénticos'],['recycle','Desmantelar duplicados comunes o raros sobrantes']]){const l=el('label'),i=el('input');i.type='checkbox';i.checked=cfg[k];l.append(i,document.createTextNode(label));c.append(l);inputs[k]=i;}
   button(c,'Guardar reglas',()=>act('auto',Object.fromEntries(Object.entries(inputs).map(([k,i])=>[k,i.checked]))));
   const champ=select(body,'Equipar en',Object.entries(save.champions).filter(([k])=>a.unlocked.includes(k)).map(([k])=>[k,CLASSES[k]?.name||k]));
   for(const it of d.items.filter(i=>!i.listing)){
    const c=card(itemLabel(it),describe(it));if(typeof itemIconHTML==='function'){const art=el('span');art.innerHTML=itemIconHTML(it);c.prepend(art);}
    button(c,it.favorite?'★ Favorito':'☆ Proteger',()=>act('favorite',{item:it.uid,value:!it.favorite}));
    button(c,'Equipar',()=>act('equip',{item:it.uid,champion:champ.value}));
    const eq=Object.entries(a.equipment||{}).find(([,slots])=>Object.values(slots).includes(it.uid));
    if(eq)button(c,'Quitar de '+(CLASSES[eq[0]]?.name||eq[0]),()=>act('unequip',{champion:eq[0],slot:it.type}));
    else if(!it.favorite&&!it.relicId)button(c,'Vender por oro',()=>act('sell',{item:it.uid}));
   }
   if(!d.items.length)card('Tu colección comienza jugando','Completá combates para obtener oro, materiales y equipo.');
  }else if(tab==='Forja'){
   const c=card('Cinco rangos de herrería','Las mejoras hasta nivel 4 son seguras. Un intento avanzado puede fallar sin destruir el objeto. Los planos se aprenden al obtenerlos. Los desafíos requieren 3, 12, 30 y 75 victorias.');
   if(a.rank<4)button(c,'Ascender de rango',()=>act('rank',{}));
   c.append(el('p','Desafíos: '+(a.challenges.join(', ')||'ninguno')+' · Planos: '+a.blueprints.length));
   for(const r of Object.values(d.catalog.recipes)){
    const c=card(r.name,`${r.gold*d.config.forgeCostScale} oro · ${r.material} materiales · ${d.ranks[r.rank]}${r.blueprint?' · requiere plano':''}`);
    const choices=a.rank===4?field(c,'Hasta dos atributos (dmg_mult,hp_mult,speed_mult,heal_mult,cd_mult)',''):null;
    const b=button(c,'Fabricar',()=>act('craft',{recipe:r.id,attributes:choices?.value?choices.value.split(',').map(x=>x.trim()):[]}));b.disabled=a.rank<r.rank||r.blueprint&&!a.blueprints.includes(r.id);
   }
   for(const it of d.items.filter(i=>!i.listing&&!i.relicId)){
    const c=card(itemLabel(it),`Mejorar: ${Math.ceil(300*it.level*it.level*d.config.forgeCostScale)} oro · ${it.level*3} materiales`);
    button(c,'Mejorar',()=>act('upgrade',{item:it.uid}));
    if(a.rank>=2)it.affixes.forEach((x,index)=>button(c,`Refinar ${x.id} · ${2500*d.config.forgeCostScale} oro + 20 materiales`,()=>act('refine',{item:it.uid,index})));
   }
  }else if(tab==='Subastas'){
   card('Casa de subastas',`Compra inmediata en oro. Comisión del vendedor: ${d.config.feeBps/100}%. Las piezas publicadas quedan en depósito hasta venderlas o retirarlas.`);
   const filters=el('div',undefined,'eco-filters');body.append(filters);
   const rarity=select(filters,'Rareza',[['','Todas'],...RARITIES.map(k=>[k,RARITY_META[k].label])]);
   const slot=select(filters,'Categoría',[['','Todas'],...EQUIP_SLOT_TYPES.map(k=>[k,ITEM_TYPES[k].label])]);
   const attr=select(filters,'Atributo',[['','Todos'],...Object.entries(AFFIX_DB).map(([k,v])=>[k,v.effect])]);
   const market=el('div');body.append(market);
   function listings(){market.replaceChildren();for(const l of d.listings.filter(l=>(!rarity.value||l.item.rarity===rarity.value)&&(!slot.value||l.item.type===slot.value)&&(!attr.value||l.item.affixes.some(x=>x.id===attr.value)))){const c=el('section',undefined,'eco-card');c.append(el('h3',itemLabel(l.item)),el('p',describe(l.item)),el('strong',l.price+' oro'));market.append(c);button(c,l.seller===String(a.id||'')||d.items.some(i=>i.uid===l.item.uid)?'Retirar':'Comprar',()=>act(d.items.some(i=>i.uid===l.item.uid)?'cancel':'buy',{listing:l.id}));}if(!market.children.length)market.append(el('p','No hay publicaciones con esos filtros.'));}
   rarity.onchange=slot.onchange=attr.onchange=listings;listings();
   const c=card('Publicar equipo','Máximo 20 publicaciones activas. Quitá el favorito y desequipá el objeto para publicarlo.');
   const items=d.items.filter(i=>!i.listing&&!i.legacy);if(items.length){const it=select(c,'Objeto',items.map(i=>[i.uid,itemLabel(i)])),price=field(c,'Precio en oro',100,'number');price.min=1;button(c,'Publicar',()=>act('list',{item:it.value,price:Number(price.value)}));}
  }else if(tab==='Colección'){
   card('Apariencias de conjunto','Cada conjunto tiene seis piezas universales. Completar la colección desbloquea su manifestación base para siempre. Reutiliza el arte y los efectos existentes; no cambia las estadísticas ni el equipo del campeón.');
   const champ=select(body,'Campeón',Object.keys(save.champions).filter(k=>save.champions[k].unlocked).map(k=>[k,CLASSES[k]?.name||k]));
   for(const set of d.catalog.sets){const n=set.pieces.filter(k=>a.collection?.[k]).length,c=card(set.name+` · ${n}/6`,set.lore);const image=el('img');image.src=MYTHIC_APPEARANCES[set.id].preview;image.alt='Arte reutilizado de la manifestación '+set.name;image.width=112;c.append(image);
    for(const id of [set.id,set.id+'_astral',set.id+'_consagrada']){const sk=SET_SKINS[id];if(skinOwnedFull(id))button(c,'Usar '+sk.name,()=>{if(!skinCosmeticEquip(champ.value,id))throw Error('No se pudo equipar.');say('Apariencia equipada.');});else if(!sk.earnedOnly){const b=button(c,'Comprar '+sk.name+' · '+premiumPrice(id)+' Brasas',async()=>{const r=await premiumBuySkin(id);if(!r.ok)throw Error(r.reason);await economyRefresh();draw();});b.disabled=!!sk.requiresSet&&!a.cosmetics.includes(sk.requiresSet);}else c.append(el('p','Base exclusiva de juego: completá las seis piezas.'));}
   }
  }else if(tab==='Reliquias'){
   card('Códice · Reliquias Únicas',`Una sola copia por servidor. Iniciá sesión al menos cada ${d.config.inactiveDays} días para conservarla. Aviso desde el día ${d.config.warnDays}. La Bóveda conserva el historial.`);
   for(const r of d.relics){const c=card(r.name,r.lore);c.append(el('p',`${r.arena} · ${r.method} · Efecto: ${r.legendProc}`),el('p',r.status==='undiscovered'?'No descubierta':r.status==='vault'?'En la Bóveda del Game Master':'Propietario: '+(r.ownerName||r.owner)),el('small','Identificador: '+r.uid));for(const h of r.history)c.append(el('p',new Date(h.at).toLocaleDateString()+' · '+(h.name||h.owner||'Bóveda')+' · '+h.reason));}
  }else{
   button(body,'Ver ranking mensual y premio',()=>lbOpen());
   for(const s of d.seasons){const r=d.relics.find(r=>r.id===s.relic),c=card('Temporada '+s.month,r?.name);c.append(el('p',s.closed?'Cerrada · '+(s.winner?.name||'Sin ganador'):'Cierre: '+new Date(s.end).toLocaleString()));}
  }
 }
 window.economyOpen=async function(which='Inventario'){
  if(state==='playing')return;tab=tabs.includes(which)?which:'Inventario';if(!root){previous=document.activeElement;root=el('div',undefined,'eco-modal');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Economía de La Horda');const panel=el('div',undefined,'eco-panel'),head=el('header');head.append(el('h2','Arsenal de La Horda'));button(head,'Cerrar',close);panel.append(head);const nav=el('nav');nav.setAttribute('aria-label','Secciones del arsenal');for(const t of tabs){const b=button(nav,t,()=>{tab=t;draw();});b.dataset.ecoTab=t;}panel.append(nav);status=el('p');status.setAttribute('role','status');panel.append(status);body=el('div',undefined,'eco-body');panel.append(body);root.append(panel);document.body.append(root);head.querySelector('button').focus();}
  draw();say('Actualizando…');try{await economyRefresh();draw();say('');}catch(e){say(e.message);}
 };
 document.addEventListener('keydown',e=>{if(!root)return;if(e.key==='Escape'){e.stopImmediatePropagation();close();}if(e.key==='Tab'){const all=[...root.querySelectorAll('button,input,select')].filter(n=>!n.disabled),first=all[0],last=all[all.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}},true);
 const codex=document.getElementById('codex-crumbs')?.parentElement;if(codex)button(codex,'Reliquias Únicas',()=>economyOpen('Reliquias'));
 const inv=document.getElementById('myinv-tabs');if(inv){button(inv,'Forja de cuenta',()=>economyOpen('Forja'));button(inv,'Subastas',()=>economyOpen('Subastas'));}
 const hub=document.getElementById('hub-options');if(hub)button(hub,'Arsenal · Forja · Subastas',()=>economyOpen());
 window.addEventListener('economy-change',()=>{if(root&&state!=='playing')draw();});
 window.GMExt=window.GMExt||{};
 window.GMExt.economy=async ctx=>{
  const d=await ctx.api('GET','/economy'),c=ctx.panel('Economía persistente','Cada cambio queda auditado. Solo el propietario autorizado puede operar este registro.');
  const form=ctx.form(c,'Guardar configuración',async values=>{await economyAction('config',{config:JSON.parse(values.config)},{gm:true});await ctx.render('Economía');});ctx.field(form.f,'Configuración y tablas de botín','config','textarea',JSON.stringify(d.config,null,2));form.end();
  const vault=ctx.panel('Bóveda y reliquias');for(const r of Object.values(d.relics))ctx.list(vault,[r.name+' · '+r.status+' · '+(r.owner||'sin propietario')]);
  const f=ctx.form(vault,'Reintroducir la misma reliquia',async v=>{await economyAction('relic',{relic:v.relic,userId:Number(v.userId)},{gm:true});await ctx.render('Economía');});ctx.select(f.f,'Reliquia','relic',Object.values(d.relics).filter(r=>r.status!=='owned').map(r=>[r.id,r.name]));ctx.field(f.f,'ID de cuenta destinataria','userId','number');f.end();
  const season=ctx.panel('Premio de una temporada futura');const sf=ctx.form(season,'Reservar premio',async v=>{await economyAction('season',{month:v.month,relic:v.relic},{gm:true});await ctx.render('Economía');});ctx.field(sf.f,'Mes UTC (AAAA-MM)','month','month');ctx.select(sf.f,'Reliquia existente','relic',Object.values(d.relics).filter(r=>r.status!=='owned').map(r=>[r.id,r.name]));sf.end();
  const stats=ctx.panel('Supervisión');ctx.list(stats,[`Cuentas: ${Object.keys(d.accounts).length}`,`Oro: ${Object.values(d.accounts).reduce((n,a)=>n+a.gold,0)}`,`Objetos: ${Object.keys(d.items).length}`,`Subastas: ${Object.values(d.listings).filter(l=>l.state==='open').length}`]);
  const audit=ctx.panel('Últimas operaciones');ctx.list(audit,d.audit.slice(-100).reverse().map(e=>`${new Date(e.at).toISOString()} · ${e.actor} · ${e.action} · #${e.seq}`));
 };
})();
