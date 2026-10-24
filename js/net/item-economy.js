'use strict';
// One authoritative economic projection per authenticated account. Offline saves remain playable.
const ECON={data:null,user:'',busy:null,chain:Promise.resolve(),run:null,start:null,finishing:null,lastPulse:0,pending:null};
function economyActive(){return !!(ECON.data?.projection?.economyV2&&accountState().logged&&ECON.user===accountState().user);}
function economyApply(d){
 if(!d)return;ECON.data=d;const p=d.projection;if(!p?.economyV2)return;
 if(!save.economyV2){try{localStorage.setItem('horda_legacy_backup_'+ECON.user,JSON.stringify(save));}catch{economyNotify('No se pudo guardar la copia local. La copia del servidor se conserva.');}}
 save.gold=p.gold;save.gems=p.gems;save.stash=p.stash;
 if(typeof collectionRegister==='function'){save.collection=save.collection||{};for(const it of p.stash)if(it.designId&&!save.collection[it.designId])try{collectionRegister(it,true);}catch{}}
 for(const [k,c] of Object.entries(save.champions||{})){if(c.loadoutItems)continue;c.equipment=p.champions?.[k]?.equipment||{};if(d.account?.unlocked?.includes(k))c.unlocked=true;}
 save.cosmeticUnlocks={...save.cosmeticUnlocks,...p.cosmeticUnlocks};save.economyV2=true;
 if(d.account?.titles?.length&&save.quests){save.quests.titles=save.quests.titles||[];if(!save.quests.titles.includes('lb_campeon'))save.quests.titles.push('lb_campeon');}
 if(typeof invalidatePassiveCache==='function')invalidatePassiveCache();
 persist();window.dispatchEvent(new CustomEvent('economy-change'));
}
async function economyRefresh(){
 const who=accountState();if(!who.logged){ECON.data=null;ECON.user='';ECON.run=null;return null;}
 if(ECON.busy)return ECON.busy;
 ECON.user=who.user;
 return ECON.busy=(async()=>{const r=await accountFetch('GET','/api/economy');if(r.status!==200)throw Error(r.j.msg||'Economía no disponible');if(accountState().user===who.user)economyApply(r.j.snapshot||r.j);return ECON.data;})().finally(()=>ECON.busy=null);
}
// Recarga el inventario autoritativo (tras una compra/regalo hecho por el servidor fuera de /api/economy/action, p. ej. Brasas→pieza).
function economyReload(){ECON.busy=null;return economyRefresh().catch(()=>null);}
function economyAction(op,args={},options={}){
 const user=accountState().user,requestId=options.requestId||crypto.randomUUID();
 const job=ECON.chain.catch(()=>{}).then(async()=>{
  if(!accountState().logged||accountState().user!==user)throw Error('La sesión cambió.');
  const r=await accountFetch('POST',options.gm?'/api/gm/economy/action':'/api/economy/action',{op,args,requestId});
  if(r.status!==200)throw Object.assign(Error(r.j.msg||r.j.error||'No se pudo completar la operación'),{status:r.status});
  if(!options.gm&&accountState().user===user)economyApply(r.j.snapshot);return r.j;
 });ECON.chain=job;return job;
}
function economyNotify(s){if(typeof showNetToast==='function')showNetToast(s);}
function economyStart(){
 if(!economyActive())return;
 if((ECON.run||ECON.start&&!ECON.finishing)&&typeof endlessOn==='function'&&endlessOn())return;
 ECON.finishing=null;ECON.run=null;ECON.elapsedBase=runElapsedMs||0;
 const mode=typeof endlessOn==='function'&&endlessOn()?'endless':typeof netInRoom==='function'&&netInRoom()?'multiplayer':'campaign';
 if(['convergencia','divina','coliseum','crystal_wars'].includes(currentArena))return; // Normalized PvP/exploration modes keep their existing non-economic flow.
 ECON.start=economyAction('run.start',{arena:currentArena,champion:player?.classKey||selectedClass,mode}).then(r=>{ECON.run=r.run;return r.run;}).catch(e=>{economyNotify('Sin recompensa online: '+e.message);return null;});
}
async function economyFinish(victory,extra={}){
 if(!economyActive())return null;if(ECON.finishing)return ECON.finishing;
 const duration=Math.max(0,Math.round((extra.durationMs??runElapsedMs??0)-(ECON.elapsedBase||0))),round=extra.round||1;
 ECON.finishing=(async()=>{await ECON.start;if(!ECON.run)return null;
  const requestId=crypto.randomUUID(),args={run:ECON.run.id,victory,durationMs:duration,round,score:extra.score||0};
  ECON.pending={requestId,args,user:accountState().user};localStorage.setItem('horda_economy_pending',JSON.stringify(ECON.pending));
  try{const r=await economyAction('run.finish',args,{requestId});ECON.pending=null;localStorage.removeItem('horda_economy_pending');ECON.run=null;ECON.start=null;
   if(typeof victoryData!=='undefined'&&victoryData?.economyPending){victoryData.rewards=r.items;victoryData.gems=r.materials;victoryData.gold=save.gold;victoryData.economyPending=false;if(state==='victory')renderVictoryStep();}
   if(state==='gameover'){const line=document.getElementById('go-progress');if(line){const n=document.createElement('p');n.textContent=`Guardado: +${r.gold} oro · ${r.items.length} objetos · +${r.materials} materiales`;line.append(n);}}
   economyNotify(`Recompensa guardada: +${r.gold} oro · +${r.materials} materiales · ${r.items.length} objetos`);return r;}
  catch(e){if(e.status>=400&&e.status<500){localStorage.removeItem('horda_economy_pending');const run=ECON.run;ECON.run=null;ECON.start=null;if(run)economyAction('run.abandon',{run:run.id}).catch(()=>{});economyNotify('Resultado rechazado: '+e.message);}else economyNotify('Recompensa pendiente: '+e.message);throw e;}
 })();return ECON.finishing;
}
async function economyRetry(){
 let p;try{p=JSON.parse(localStorage.getItem('horda_economy_pending')||'null');}catch{}
 if(!p||p.user!==accountState().user)return;
 try{await economyAction('run.finish',p.args,{requestId:p.requestId});localStorage.removeItem('horda_economy_pending');ECON.run=null;}catch{}
}
// Hook real entry/exit paths; guests entering a match use the same startRun setup.
const _ecoStartRun=startRun;startRun=function(...args){const r=_ecoStartRun(...args);economyStart();return r;};
const _ecoStarter=grantStarterChampion;grantStarterChampion=function(k){if(!economyActive())return _ecoStarter(k);if(!ECON.data.account.unlocked.length)economyAction('starter',{champion:k}).catch(e=>economyNotify(e.message));return _ecoStarter(k);};
const _ecoLoot=grantEndOfRunLoot;grantEndOfRunLoot=function(champ,perf,win){if(!economyActive())return _ecoLoot(champ,perf,win);if(typeof endlessOn==='function'&&endlessOn())return {items:[],inventoryFull:false,grade:perf.grade,gems:0,pending:true};economyFinish(win).catch(()=>{});return {items:[],inventoryFull:false,grade:perf.grade,gems:0,pending:true};};
const _ecoLB=lbAfterRun;lbAfterRun=function(L){if(!economyActive())return _ecoLB(L);L.lb={st:'sending'};economyFinish(false,{round:EN.round,score:Math.round(EN.score),durationMs:L.timeMs}).then(r=>{L.lb={st:r?.ranking?'ok':'rejected',rank:r?.ranking?.rank,total:r?.ranking?.total,msg:'Solo participan campeones competitivos.'};_lbRenderRunLine();}).catch(e=>{L.lb={st:'offline',msg:e.message};_lbRenderRunLine();});};
const _ecoAdd=addItemToInventory;addItemToInventory=function(...args){if(economyActive())return null;return _ecoAdd(...args);};
// Combat coins are a preview only; settled value comes from the run receipt.
const _ecoGold=grantGold;grantGold=function(n){if(economyActive())return;return _ecoGold(n);};
function economyMutate(op,args,rerender){economyAction(op,args).then(()=>{if(rerender)rerender();if(typeof renderSaveLine==='function')renderSaveLine();}).catch(e=>economyNotify(e.message));}
const _ecoEquip=equipItem;equipItem=function(c,uid){if(!economyActive())return _ecoEquip(c,uid);economyMutate('equip',{champion:c,item:uid},()=>{if(state==='inventory')renderMyInventory();else if(typeof renderPrepTabs==='function')renderPrepTabs();});return false;};
const _ecoUnequip=unequipItem;unequipItem=function(c,slot){if(!economyActive())return _ecoUnequip(c,slot);economyMutate('unequip',{champion:c,slot},()=>{if(state==='inventory')renderMyInventory();});};
const _ecoFavorite=toggleItemFavorite;toggleItemFavorite=function(uid){if(!economyActive())return _ecoFavorite(uid);economyMutate('favorite',{item:uid,value:!findStashItem(uid)?.favorite},renderMyInventory);return false;};
const _ecoSell=sellItem;sellItem=function(c,uid){if(!economyActive())return _ecoSell(c,uid);economyMutate('sell',{item:uid},renderMyInventory);return null;};
const _ecoDiscard=discardItem;discardItem=function(c,uid){if(!economyActive())return _ecoDiscard(c,uid);economyMutate('discard',{item:uid},renderMyInventory);return null;};
const _ecoFuse=fuseItems;fuseItems=function(c,items){if(!economyActive())return _ecoFuse(c,items);economyMutate('fuse',{items},renderMyInventory);return {ok:true,pending:true};};
const _ecoUpgrade=upgradeItemLevel;upgradeItemLevel=function(uid){if(!economyActive())return _ecoUpgrade(uid);economyMutate('upgrade',{item:uid},()=>{if(state==='inventory')renderMyInventory();});return {ok:true,pending:true};};
const _ecoCraft=craftMythic;craftMythic=function(id){if(!economyActive())return _ecoCraft(id);economyOpen('Forja');return {ok:false,reason:'Usá la forja de cuenta para fabricar con el servidor.'};};
const _ecoBuyChampion=shopBuyChampion;shopBuyChampion=function(id,...rest){if(!economyActive())return _ecoBuyChampion(id,...rest);economyMutate('champion.buy',{champion:id},()=>{if(typeof renderChampions==='function')renderChampions();});return {ok:true,pending:true};};
const _ecoBuyCatalog=shopBuyCatalog;shopBuyCatalog=function(...args){if(!economyActive())return _ecoBuyCatalog(...args);economyOpen('Forja');return {ok:false,reason:'Los objetos de cuenta se fabrican en la forja o se compran por oro en subastas.'};};
window.addEventListener('account-change',()=>{if(!accountState().logged){ECON.data=null;ECON.user='';}else if(!ECON.data&&state!=='playing')economyRefresh().then(economyRetry).catch(()=>{});});
setInterval(()=>{
 if(!accountState().logged)return;
 if(ECON.run&&state==='playing'&&Date.now()-ECON.lastPulse>10000){ECON.lastPulse=Date.now();economyAction('run.pulse',{run:ECON.run.id,round:typeof endlessOn==='function'&&endlessOn()?EN.round:1}).catch(()=>{});}
 else if(!ECON.data&&state!=='playing')economyRefresh().then(economyRetry).catch(()=>{});
},3000);

// Old local economic editors cannot mutate online property; keep their offline paths.
const _ecoReroll=openAffixReroll;openAffixReroll=function(...args){if(!economyActive())return _ecoReroll(...args);economyOpen('Forja');};
const _ecoShop=shopBuy;shopBuy=function(...args){if(!economyActive())return _ecoShop(...args);economyOpen('Forja');return {ok:false,reason:'El equipo de cuenta se obtiene en la forja y en subastas.'};};
const _ecoTradeBound=tradeBoundReason;tradeBoundReason=function(it){return economyActive()?'El equipo persistente se comercia en la casa de subastas.':_ecoTradeBound(it);};
const _ecoSkinOwned=skinOwnedFull;skinOwnedFull=function(id){if(economyActive()&&SET_SKINS[id]?.manifest)return ECON.data.account.cosmetics.includes(id);return _ecoSkinOwned(id);};
// Auto-collect host/guest drop events. The server chooses the item and caps the rate.
const _ecoDrop=groundLootDrop;groundLootDrop=function(...args){
 if(!economyActive())return _ecoDrop(...args);if(!ECON.run)return null;
 // x,y,grade,hm,arena,rk,build: el servidor elige el objeto con el catálogo del juego; el cliente solo declara la fuente (acotada por el servidor)
 economyAction('run.loot',{run:ECON.run.id,rank:args[5]||'normal',build:args[6]===1||args[6]===true}).then(r=>{for(const it of r.items){groundLootToast(it);if(EN?.local?.loot)EN.local.loot.push(it);}if(r.automatic?.fused||r.automatic?.materials)economyNotify('Botín organizado: '+(r.automatic.fused||0)+' fusiones · '+(r.automatic.materials||0)+' materiales');}).catch(()=>{});return null;
};
const _ecoGuestStart=netGuestStartRun;netGuestStartRun=function(msg){const same=ECON.run&&netMatch&&!netMatch.ended;const result=_ecoGuestStart(msg);if(!same)economyStart();return result;};
// Leaving an unfinished match releases its equipment lock, without issuing a reward.
let _ecoWasPlaying=false;
setInterval(()=>{const playing=['playing','paused','buff'].includes(state);if(_ecoWasPlaying&&!playing&&ECON.run&&!ECON.finishing){const run=ECON.run;setTimeout(()=>{if(ECON.run===run&&!ECON.finishing&&!['playing','paused','buff'].includes(state)){ECON.run=null;economyAction('run.abandon',{run:run.id}).catch(()=>{});}},2000);}_ecoWasPlaying=playing;},1000);

/* ---------------------------------------------------------------------------------------------------------------
   Fuentes VIEJAS de recompensas (docs/economy/ITEM_ECONOMY_V2_INTEGRACION.md). Con la economía V2 activa y sesión iniciada, oro, gemas
   y objetos son del servidor: lo que estas rutas escribían en el guardado local se pisaba en la próxima proyección. Cada una pasa ahora
   por una operación idempotente del servidor (requestId persistido y reintentado) o queda bloqueada con un mensaje. Sin sesión,
   sin servidor persistente o con HORDA_ITEM_ECONOMY=0 NADA de esto actúa (economyActive() = false): se conserva el comportamiento anterior.
--------------------------------------------------------------------------------------------------------------- */
// Cola persistente de reclamos de oro/gemas (misiones, logros, pase): sobrevive a recargas y reintenta con el MISMO requestId.
const ECON_CLAIMS_KEY='horda_economy_claims';
function _ecoClaims(){try{return JSON.parse(localStorage.getItem(ECON_CLAIMS_KEY)||'[]').filter(c=>c&&c.requestId&&c.args);}catch{return [];}}
function _ecoClaimsSave(list){try{localStorage.setItem(ECON_CLAIMS_KEY,JSON.stringify(list.slice(-200)));}catch{}}
let _ecoClaimsBusy=false;
async function economyFlushClaims(){
 if(_ecoClaimsBusy||!economyActive())return;_ecoClaimsBusy=true;
 try{for(const c of _ecoClaims()){
  if(c.user!==accountState().user)continue;
  try{await economyAction('reward.claim',c.args,{requestId:c.requestId});_ecoClaimsSave(_ecoClaims().filter(x=>x.requestId!==c.requestId));}
  catch(e){if(e.status>=400&&e.status<500&&e.status!==401&&e.status!==429){_ecoClaimsSave(_ecoClaims().filter(x=>x.requestId!==c.requestId));economyNotify('Recompensa rechazada: '+e.message);}else break;}
 }}finally{_ecoClaimsBusy=false;}
}
function economyQueueClaim(source,gold,gems){
 const list=_ecoClaims();list.push({requestId:'claim_'+crypto.randomUUID().replace(/-/g,''),user:accountState().user,args:{source,gold:gold|0,gems:gems|0}});_ecoClaimsSave(list);economyFlushClaims();
}
// Misiones / desafíos / logros / pase: el oro y las gemas se reclaman al servidor; títulos, marcos y XP siguen locales.
const _ecoQGrant=questsGrant;questsGrant=function(r,silent){
 if(!economyActive()||!r||(!r.gold&&!r.gems))return _ecoQGrant(r,silent);
 const rest={...r};delete rest.gold;delete rest.gems;_ecoQGrant(rest,silent);
 economyQueueClaim('quest',r.gold,r.gems);
};
// Cofres de misión: el servidor tira el botín con el catálogo real (sin tope de inventario); el cofre solo se consume si respondió.
const _ecoChestUI=questsOpenChestUI;questsOpenChestUI=function(){
 if(!economyActive())return _ecoChestUI();
 const q=questsState();if(!q.chests.length)return;
 const variant=q.chests[0];save.economyChestSalt=save.economyChestSalt||crypto.randomUUID().replace(/-/g,'').slice(0,16);
 const requestId=`chest_${(q.counts.chests|0)}_${variant}_${save.economyChestSalt}`;
 economyAction('chest.open',{variant,arena:_qChestArena(),champion:_qChestChamp()},{requestId}).then(r=>{
  if(q.chests[0]===variant){q.chests.shift();q.counts.chests++;persist();}
  const orig=questsOpenChest;questsOpenChest=()=>({variant,items:r.items,gold:0,gems:r.gems,grade:r.grade});
  try{_ecoChestUI();}finally{questsOpenChest=orig;}
 }).catch(e=>economyNotify('No se pudo abrir el cofre: '+e.message));
};
// Regalo de skin de set (regalo inicial / vale): las piezas que faltan las entrega el servidor (máximo 2 regalos por cuenta).
const _ecoGiftSkin=_giftSkin;_giftSkin=function(k,id){
 if(!economyActive()||!(typeof SET_DB!=='undefined'&&SET_DB[id]&&typeof SET_SKINS!=='undefined'&&SET_SKINS[id]&&!(typeof CROMA_SKINS!=='undefined'&&CROMA_SKINS[id])))return _ecoGiftSkin(k,id);
 if(SET_SKINS[id]?.manifest)return {ok:false,reason:'Esta manifestación se obtiene en Colección.'};
 if(typeof state!=='undefined'&&state==='playing')return {ok:false,reason:'Se elige fuera de la partida'};
 const c=(typeof skinSetChamp==='function'&&skinSetChamp(id))||k;
 economyAction('gift.set',{set:id}).then(()=>{if(c&&save.champions[c]?.unlocked&&typeof skinEquipOn==='function')skinEquipOn(id,c);economyNotify('Regalo entregado: piezas del set en tu Arsenal');})
  .catch(e=>{save.skinVoucher=(save.skinVoucher|0)+1;persist();economyNotify('No se pudo entregar el regalo ('+e.message+'). Quedó como vale.');});
 return {ok:true,kind:'set',equipped:false,champ:c,n:(typeof shopSetMissing==='function'?shopSetMissing(id).length:0),pending:true};
};
// Reinicio de talentos con oro: el servidor descuenta primero; el árbol solo se reinicia si cobró.
let _ecoTalentRerender=null;
const _ecoRenderTree=renderTalentTree;renderTalentTree=function(panel,classKey,rerender){_ecoTalentRerender=rerender;return _ecoRenderTree(panel,classKey,rerender);};
const _ecoRespec=talentRespec;talentRespec=function(classKey,confirmed){
 if(!economyActive()||!confirmed)return _ecoRespec(classKey,confirmed);
 const cost=talentRespecCost(classKey);if(cost<=0)return _ecoRespec(classKey,true);
 const reason=talentRespecLockReason(classKey);if(reason)return {ok:false,reason};
 economyAction('spend',{amount:cost,reason:'talent.respec'}).then(()=>{save.gold+=cost;_ecoRespec(classKey,true);if(_ecoTalentRerender)_ecoTalentRerender();economyNotify('Talentos reiniciados');}).catch(e=>economyNotify('No se pudo reiniciar: '+e.message));
 return {ok:true,pending:true};
};
// Bonus histórico de playtest v1 (+2000 oro locales una vez): con la economía V2 no se otorga (el oro es del servidor); si se otorgó antes de migrar, la migración lo importó.
const _ecoPlaytest=grantPlaytestV1Bonus;grantPlaytestV1Bonus=function(){if(economyActive())return;return _ecoPlaytest();};
// Reintentos al volver la sesión / la red
window.addEventListener('economy-change',()=>{economyFlushClaims();});
setInterval(()=>{economyFlushClaims();},15000);

// Campeones de Ascensión ganados por logro (ascension-unlocks.js): se registran en el ledger o la proyección los revertiría.
function economySyncAscension(){
 if(!economyActive()||typeof ASCENSION_UNLOCKS==='undefined')return;
 for(const u of ASCENSION_UNLOCKS)if(save.champions[u.id]?.unlocked&&!ECON.data.account.unlocked.includes(u.id)){
  const id=u.id;economyAction('ascension.unlock',{champion:id},{requestId:'asc_'+id}).catch(e=>{if(e.status===403&&save.champions[id])save.champions[id].unlocked=false;});
 }
}
window.addEventListener('economy-change',()=>setTimeout(economySyncAscension,300));
if(typeof ascensionCheckUnlocks==='function'){const _ecoAsc=ascensionCheckUnlocks;ascensionCheckUnlocks=function(silent){const r=_ecoAsc(silent);if(r.length)setTimeout(economySyncAscension,100);return r;};}
