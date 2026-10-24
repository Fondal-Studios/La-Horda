'use strict';
const crypto=require('node:crypto'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=()=>require('./item-economy');
const DAY=86400000,ARENAS=['ciudad','fortaleza','bosque','micelial','hielo','acuatica','laberinto','abismo','minas','infernal'];
const clone=x=>JSON.parse(JSON.stringify(x));
function fail(m,status=400){throw Object.assign(new Error(m),{status});}
function int(v,min,max){if(!Number.isSafeInteger(v)||v<min||v>max)fail('INVALID_VALUE');return v;}
function month(t){return new Date(t).toISOString().slice(0,7);}
function bounds(k){const start=Date.parse(k+'-01T00:00:00Z'),d=new Date(start);d.setUTCMonth(d.getUTCMonth()+1);return {start,end:+d};}
let C;
function data(){if(C)return C;const c=vm.createContext({});for(const f of ['items','sets','legendaries','item-identity','affixes','loot','mythic-sets-v2'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/data/'+f+'.js'),'utf8'),c,{timeout:1000});return C=vm.runInContext('({values:RARITY_VALUES,items:DESIGNED_ITEMS,sets:SET_DB,loot:ARENA_LOOT,affixes:AFFIX_DB,sell:SELL_VALUE})',c);}
function normalizeItem(it){
 it.level=Math.max(1,Math.min(10,Number(it.level)||1));it.roll=Number.isFinite(it.roll)?Math.max(.5,Math.min(1.2,it.roll)):1;
 it.passives=Array.isArray(it.passives)?it.passives:[];it.affixes=Array.isArray(it.affixes)?it.affixes:[];it.mythicPassive=it.mythicPassive||null;
 it.icon=it.icon||'';it.statKey=it.type;it.champion=it.champion||null;return it;
}
function generated(type,rarity,owner,designId){
 const d=designId&&data().items[designId];
 return normalizeItem({uid:crypto.randomUUID(),owner,type,rarity,designId:designId||undefined,designed:!!d,name:d?.name||({arma:'Hoja',escudo:'Égida',casco:'Yelmo',pechera:'Coraza',guantes:'Guantes',botas:'Botas'}[type]+' · '+rarity),set:d?.set||null,value:data().values[type][rarity],level:1,passives:[],legendProc:d?.legendProc||(['legendario','mitico'].includes(rarity)?'hit_shield':undefined),lore:d?.lore||'',favorite:false});
}
function prepare(s){s.runs=s.runs||{};s.migrations=s.migrations||{};s.champions=s.champions||[];s.config.dropTables=s.config.dropTables||clone(data().loot);s.config.rewardGold=s.config.rewardGold||{victory:1200,minute:40};return s;}
async function migrate(s,u,store,now){
 prepare(s);const id=String(u.id);if(s.migrations[id])return;
 const saved=await store.getSave(u.id);let old={};try{old=JSON.parse(saved?.data||'{}')||{};}catch{}
 const a=s.accounts[id]||(s.accounts[id]={gold:0,materials:0,rank:0,xp:0,challenges:[],blueprints:[],cosmetics:[],lastSeen:now});
 // Snapshot predates this account's first economic mutation. Never imports a request body.
 s.migrations[id]={at:now,sourceVersion:saved?.version||0,backup:clone(old)};
 a.gold=Math.max(a.gold,Math.min(1e9,Math.max(0,Math.floor(Number(old.gold)||0))));
 a.materials=Math.max(a.materials,Math.min(1e9,Math.max(0,Math.floor(Number(old.gems)||0))));
 a.firstWinLoot=!!old.firstWinLoot||Object.values(old.arenasCleared||{}).some(Boolean);a.lootPity=old.lootPity&&typeof old.lootPity==='object'?{legendario:+old.lootPity.legendario||0,set:+old.lootPity.set||0,mitico:+old.lootPity.mitico||0,unico:+old.lootPity.unico||0}:undefined;a.equipment={};a.autoLoot={enabled:true,fuse:true,recycle:false};a.unlocked=Object.keys(old.champions||{}).filter(k=>old.champions[k]?.unlocked);a.names=u.name||u.user;a.collection={};
 for(const it of (Array.isArray(old.stash)?old.stash:[])){
  if(!it||typeof it.uid!=='string'||!E().SLOTS.includes(it.type)||!E().RARITIES.includes(it.rarity)||!Number.isFinite(it.value))continue;
  const uid=crypto.createHash('sha256').update(id+':legacy:'+it.uid).digest('hex').slice(0,40);
  if(s.items[uid])continue;
  const next=normalizeItem({...clone(it),uid,owner:id,legacy:true,legacyUid:it.uid});delete next.relicId;delete next.listing;next.value=Math.max(0,Math.min(next.value,data().values[it.type][it.rarity]));s.items[uid]=next;
  for(const [champ,rec] of Object.entries(old.champions||{}))for(const [slot,value] of Object.entries(rec.equipment||{}))if(value===it.uid)(a.equipment[champ]||(a.equipment[champ]={}))[slot]=uid;
  if(next.designId)a.collection[next.designId]=true;
 }
 for(const [k,v] of Object.entries(old.cosmeticUnlocks||{}))if(v&&!/^(lucifer|glaciar|coloso|tempestad|alba)(_|$)/.test(k)&&!a.cosmetics.includes(k))a.cosmetics.push(k);
 unlock(s,id);E().audit(s,u.id,'migration',{sourceVersion:saved?.version||0,items:Object.values(s.items).filter(it=>it.owner===id).length},now);
}
function unlock(s,id){const a=s.accounts[id];a.collection=a.collection||{};for(const it of Object.values(s.items))if(it.owner===id&&it.designId)a.collection[it.designId]=true;for(const set of E().catalog().sets)if(set.pieces.every(p=>a.collection[p])&&!a.cosmetics.includes(set.id))a.cosmetics.push(set.id);}
function project(s,id,d){
 const a=s?.accounts?.[id];if(!s?.migrations?.[id]||!a)return d;
 d.gold=a.gold;d.gems=a.materials;d.stash=Object.values(s.items).filter(it=>it.owner===id&&!it.listing).map(it=>normalizeItem(clone(it)));
 d.economyV2=true;d.champions=d.champions||{};
 for(const [k,c] of Object.entries(d.champions)){c.equipment=clone(a.equipment?.[k]||{});for(const slot of Object.keys(c.equipment))if(!d.stash.some(it=>it.uid===c.equipment[slot]))c.equipment[slot]=null;}
 for(const [k,c] of Object.entries(d.champions))if(!require('./entitlements').taxonomy().requiresGrant(k))c.unlocked=(a.unlocked||[]).includes(k);
 for(const k of a.unlocked||[])if(d.champions[k]&&!require('./entitlements').taxonomy().requiresGrant(k))d.champions[k].unlocked=true;
 d.cosmeticUnlocks=d.cosmeticUnlocks||{};for(const k of Object.keys(d.cosmeticUnlocks))if(/^(lucifer|glaciar|coloso|tempestad|alba)(_|$)/.test(k)&&!a.cosmetics.includes(k))delete d.cosmeticUnlocks[k];for(const k of a.cosmetics)d.cosmeticUnlocks[k]=true;
 return d;
}
function isEquipped(a,uid){return Object.values(a.equipment||{}).some(eq=>Object.values(eq).includes(uid));}
function removeEquipment(a,uid){for(const eq of Object.values(a.equipment||{}))for(const k in eq)if(eq[k]===uid)delete eq[k];}
function spend(a,gold,mat=0){if(a.gold<gold||a.materials<mat)fail('INSUFFICIENT_RESOURCES',409);a.gold-=gold;a.materials-=mat;}
function mine(s,id,uid){const it=s.items[uid];if(!it||it.owner!==id)fail('NOT_OWNED',403);return it;}
function active(s,id,now){return Object.values(s.runs).some(r=>r.owner===id&&!r.done&&now-r.start<6*3600000);}
function liveCommand(s,u,op,b,now){
 prepare(s);const id=String(u.id),a=s.accounts[id];
 if(op==='starter'){
  const tax=require('./entitlements').taxonomy();if(!tax.ids.includes(b.champion)||!tax.meta(b.champion).starterEligible||tax.meta(b.champion).releaseState!=='RELEASED')fail('BAD_CHAMPION');if(a.unlocked?.length)fail('STARTER_ALREADY_CHOSEN',409);a.unlocked=[b.champion];a.starter=b.champion;return {ok:true};
 }
 if(op==='run.start'){
  if(!ARENAS.includes(b.arena)&&!['divina','coliseum','crystal_wars'].includes(b.arena))fail('BAD_ARENA');
  const tax=require('./entitlements').taxonomy();if(!tax.ids.includes(b.champion))fail('CHAMPION_LOCKED',403);
  if(!a.unlocked?.length&&tax.meta(b.champion).starterEligible&&tax.meta(b.champion).releaseState==='RELEASED'){a.unlocked=[b.champion];a.starter=b.champion;}
  if(!a.unlocked?.includes(b.champion))fail('CHAMPION_LOCKED',403);
  if(!['campaign','endless','multiplayer'].includes(b.mode))fail('BAD_MODE');
  for(const r of Object.values(s.runs))if(r.owner===id&&!r.done){r.done=true;r.abandoned=true;}
  const run={id:crypto.randomUUID(),owner:id,start:now,last:now,arena:b.arena,champion:b.champion,mode:b.mode,month:month(now),round:1,pulses:0,done:false};s.runs[run.id]=run;return {run};
 }
 if(op==='run.abandon'){const r=s.runs[b.run];if(!r||r.owner!==id)fail('RUN_NOT_FOUND',404);if(!r.done){r.done=true;r.abandoned=true;}return {ok:true};}
 if(op==='auto'){a.autoLoot={enabled:b.enabled===true,fuse:b.fuse===true,recycle:b.recycle===true};return {ok:true};}
 if(op==='run.pulse'||op==='run.finish'||op==='run.loot'){
  const r=s.runs[b.run];if(!r||r.owner!==id)fail('RUN_NOT_FOUND',404);
  if(r.done){if(op==='run.finish'&&r.result)return r.result;fail('RUN_CLOSED',409);}
  const elapsed=now-r.start;if(elapsed<0||elapsed>6*3600000)fail('RUN_EXPIRED',409);
  if(op==='run.loot'){
   if(elapsed<10000||r.pulses<1)return {items:[]};
   const big=['jefe','subjefe'].includes(b.rank)&&((r.rankCount||{})[b.rank]||0)<RANK_CAP[b.rank]; // jefes y subjefes: tope propio, no consumen el cupo por tiempo
   const cap=Math.min(120,Math.floor(elapsed/20000));if(!big&&(r.lootCount||0)>=cap)return {items:[]};
   if(!big)r.lootCount=(r.lootCount||0)+1;const item=rollGround(s,r,id,b.rank,b.build===true);if(!item)return {items:[]};s.items[item.uid]=item;unlock(s,id);const automatic=autoLoot(s,id);return {items:[item],automatic};
  }
  const round=int(b.round||1,1,400);if(round<r.round||round>Math.floor(elapsed/10000)+2)fail('IMPLAUSIBLE_PROGRESS',422);
  if(op==='run.pulse'){if(now-r.last<5000)return {ok:true};r.last=now;r.round=round;r.pulses++;return {ok:true};}
  const duration=int(b.durationMs,0,6*3600000);if(duration>elapsed+5000||duration>=10000&&r.pulses<1)fail('IMPLAUSIBLE_DURATION',422);
  const win=b.victory===true;if(win&&(duration<120000||r.pulses<3))fail('IMPLAUSIBLE_VICTORY',422);
  const capped=Math.min(duration,elapsed);const gold=Math.min(10000,Math.floor(capped/60000)*s.config.rewardGold.minute+(win?s.config.rewardGold.victory:0));
  a.gold=Math.min(1e9,a.gold+gold);const materials=win?3:Math.floor(capped/180000);a.materials=Math.min(1e9,a.materials+materials);
  const loot=[];
  if(win||capped>=120000){
   const got=rollChest(s,r,id,win,capped);
   if(win){const gift=firstWin(s,r,id);if(gift){if(got.length)got[0]=gift;else got.push(gift);}}
   for(const it of got){s.items[it.uid]=it;loot.push(it);}
  }
  if(win){
   const unique=Object.values(s.relics).find(x=>x.arena===r.arena&&E().RELICS.some(def=>def.id===x.id)&&['undiscovered','vault'].includes(x.status)&&!Object.values(s.seasons).some(season=>!season.closed&&season.relic===x.id));
   const table=s.config.dropTables[r.arena]||{},total=Object.values(table).reduce((n,w)=>n+w,0);
   if(unique&&total>0&&crypto.randomInt(1e9)/1e9<(table.unico||0)/total){const it=s.items[unique.uid]||generated(unique.type,'mitico',id);it.uid=unique.uid;it.relicId=unique.id;it.rarity='unico';it.name=unique.name;it.legendProc=unique.legendProc;s.items[it.uid]=it;E().transfer(s,it,id,'boss-reward',now);loot.push(it);}
   a.wins=(a.wins||0)+1;for(let n=1;n<=4;n++)if(a.wins>=[3,12,30,75][n-1]&&!a.challenges.includes('forge_'+n))a.challenges.push('forge_'+n);
   if(ARENAS.indexOf(r.arena)>=5&&crypto.randomInt(100)<5){const recipes=Object.keys(E().catalog().recipes).filter(k=>E().catalog().recipes[k].blueprint&&!a.blueprints.includes(k));if(recipes.length)a.blueprints.push(recipes[crypto.randomInt(recipes.length)]);}
  }
  unlock(s,id);const automatic=autoLoot(s,id);r.done=true;r.round=round;
  let ranking=null;
  if(r.mode==='endless'){
   const meta=require('./entitlements').taxonomy().meta(r.champion);if(meta.competitiveAllowed&&meta.releaseState==='RELEASED'){
    const score=int(b.score||0,0,2e9),max=Math.ceil((1+.1*(round-1))*1.5*(28000*capped/60000+4000*round)+225*round*(round+1)/2);
    if(score>max)fail('IMPLAUSIBLE_SCORE',422);
    const season=s.seasons[r.month];if(season&&!season.closed&&now<season.end){const row={userId:id,name:u.name||u.user,guardian:r.champion,score,round,durationMs:capped,at:now};const old=season.results.find(x=>x.userId===id);if(!old||compare(row,old)<0){season.results=season.results.filter(x=>x.userId!==id);season.results.push(row);}season.results.sort(compare);ranking={rank:season.results.findIndex(x=>x.userId===id)+1,total:season.results.length};}
   }
  }
  r.result={ok:true,gold,materials,items:loot,automatic,ranking};return r.result;
 }
 if(['equip','unequip','sell','discard','fuse','dismantle'].includes(op)){
  if(active(s,id,now))fail('RUN_ACTIVE',409);
  if(op==='unequip'){if(!E().SLOTS.includes(b.slot))fail('BAD_SLOT');if(a.equipment?.[b.champion])delete a.equipment[b.champion][b.slot];return {ok:true};}
  if(op==='fuse'){
   if(!Array.isArray(b.items)||b.items.length!==3||new Set(b.items).size!==3)fail('THREE_ITEMS_REQUIRED');const items=b.items.map(uid=>mine(s,id,uid)),first=items[0];
   if(items.some(it=>it.favorite||it.listing||it.relicId||it.set||it.designed||isEquipped(a,it.uid)||it.type!==first.type||it.rarity!==first.rarity)||!['comun','raro'].includes(first.rarity))fail('PROTECTED_ITEM');
   const item=generated(first.type,first.rarity==='comun'?'raro':'muyraro',id);item.level=Math.max(...items.map(x=>x.level));item.legacy=items.some(x=>x.legacy);items.forEach(x=>delete s.items[x.uid]);s.items[item.uid]=item;return {item};
  }
  const it=mine(s,id,b.item);if(it.listing)fail('IN_ESCROW');
  if(op==='equip'){if(!a.unlocked.includes(b.champion))fail('CHAMPION_LOCKED');if(it.champion&&it.champion!==b.champion||!require('./item-economy-loot').canEquip(it,b.champion))fail('INCOMPATIBLE_ITEM');removeEquipment(a,it.uid);(a.equipment[b.champion]||(a.equipment[b.champion]={}))[it.type]=it.uid;it.equipped=true;return {ok:true};}
  if(it.favorite||it.relicId||isEquipped(a,it.uid))fail('PROTECTED_ITEM');
  const value=data().sell[it.rarity]||0;if(op==='sell')a.gold=Math.min(1e9,a.gold+value);if(op==='dismantle')a.materials+=Math.max(1,E().RARITIES.indexOf(it.rarity));delete s.items[it.uid];return {ok:true};
 }
 if(op==='champion.buy'){
  const tax=require('./entitlements').taxonomy(),meta=tax.meta(b.champion),p=require('./wallet').pricing().PRICING;
  if(!tax.ids.includes(b.champion)||!meta.purchasable||meta.releaseState!=='RELEASED')fail('NOT_PURCHASABLE');
  if(a.unlocked.includes(b.champion))fail('ALREADY_OWNED');spend(a,p.gold.ascension[b.champion]||p.gold.champion);a.unlocked.push(b.champion);return {ok:true};
 }
 return undefined;
}
function compare(a,b){return b.score-a.score||b.round-a.round||a.durationMs-b.durationMs||a.at-b.at||String(a.userId).localeCompare(String(b.userId));}
function seasons(s,now){
 prepare(s);
 for(const season of Object.values(s.seasons))if(!season.closed&&now>=season.end){
  season.closed=true;season.results.sort(compare);const winner=season.results[0],r=s.relics[season.relic];
  if(winner&&r&&['undiscovered','vault'].includes(r.status)){
   const id=String(winner.userId),a=s.accounts[id];const it=s.items[r.uid]||generated(r.type,'mitico',id);it.uid=r.uid;it.rarity='unico';it.relicId=r.id;it.name=r.name+' de '+(r.originalWinner||winner.name);it.legendProc=r.legendProc;it.value=data().values[r.type].mitico;
   s.items[it.uid]=it;r.originalWinner=r.originalWinner||winner.name;E().transfer(s,it,id,'monthly-prize',now);season.winner={...winner,title:'Campeón '+season.month};a.titles=a.titles||[];a.titles.push(season.winner.title);E().audit(s,'server','season.closed',{month:season.month,winner:id},now);
  }
 }
 const k=month(now);if(!s.seasons[k]){
  const id='season_'+k.replace('-','_'),r={id,name:'Corona del Abismo · '+k,arena:'abismo',type:'casco',legendProc:'skill_nova',lore:'El nombre de su primer campeón perdurará.',method:'Primer puesto de la temporada mensual '+k,image:'assets/ui/skill-icons/nova-de-escarcha.png',uid:'relic_'+id,owner:null,status:'undiscovered',history:[],originalWinner:null};
  s.relics[id]=r;s.seasons[k]={month:k,relic:id,...bounds(k),closed:false,results:[]};
 }
}
function ranking(s,k,id,guardian){const season=s.seasons[k];const rows=(season?.results||[]).filter(r=>!guardian||r.guardian===guardian).sort(compare);const me=rows.find(r=>r.userId===id);return {week:k,month:k,current:month(Date.now()),endsAt:season?.end||bounds(k).end,total:rows.length,entries:rows.slice(0,50).map((r,i)=>({...r,rank:i+1,me:r.userId===id})),me:{...me,rank:rows.findIndex(r=>r.userId===id)+1},prize:season?s.relics[season.relic]:null,champions:Object.values(s.seasons).filter(x=>x.closed&&x.winner).map(x=>({month:x.month,...x.winner}))};}
// Botín: mismo catálogo y reglas que el cliente (server/item-economy-loot.js ejecuta js/systems/loot.js y ground-loot.js reales).
const GROUND_RANKS=['normal','subelite','elite','named','subjefe','jefe'];
const RANK_CAP={normal:120,subelite:120,elite:120,named:60,subjefe:24,jefe:12};
function fromGame(raw,id){const it=normalizeItem({...raw,uid:crypto.randomUUID(),owner:id});delete it.overflow;it.favorite=false;return it;}
function ownedDesigns(s,id){const set=new Set();for(const it of Object.values(s.items))if(it.owner===id&&it.designId)set.add(it.designId);return set;}
function lootCtx(s,r,id){const a=s.accounts[id];a.lootPity=Object.assign({legendario:0,set:0,mitico:0,unico:0},a.lootPity||{});return {arena:r.arena==='divina'?'divina':r.arena,champion:r.champion,endless:r.mode==='endless',owned:ownedDesigns(s,id),pity:a.lootPity};}
function rollGround(s,r,id,rank,build){
 const L=require('./item-economy-loot'),cfg=L.groundCfg(),rk=GROUND_RANKS.includes(rank)?rank:'normal',o=lootCtx(s,r,id);
 r.rankCount=r.rankCount||{};
 const used=r.rankCount[rk]||0,eff=used>=RANK_CAP[rk]?'normal':rk; // un rango alto declarado de más baja a "normal": no se acumula legendario por pedir "jefe"
 r.rankCount[rk]=used+1;
 const out=L.rollOne({...o,source:'ground',grade:cfg.grade[eff],highMult:cfg.highMult[eff],floor:r.rankCount[eff]===1||eff!==rk?(cfg.floor[eff]||null):null,build:build===true&&eff!=='normal'&&Math.random()<1});
 if(!out.item)return null;const a=s.accounts[id];if(a.lootPity[out.tier]!==undefined&&out.tier!=='comun')a.lootPity[out.tier]=0;
 return fromGame(out.item,id);
}
function rollChest(s,r,id,victory,capped){
 const L=require('./item-economy-loot'),o=lootCtx(s,r,id),a=s.accounts[id];
 const res=L.rollChest({...o,victory,grade:victory?'A':'B',runLevel:victory?0:(capped>=120000?6:0),subjefes:0});
 if(victory)a.lootPity=res.pity;
 return res.items.map(x=>fromGame(x,id));
}
function firstWin(s,r,id){
 const a=s.accounts[id];if(a.firstWinLoot||r.mode!=='campaign'||!ARENAS.includes(r.arena))return null;a.firstWinLoot=true;
 const L=require('./item-economy-loot');return fromGame(L.firstWinItem(r.champion,r.arena,a.equipment?.[r.champion]||{}),id);
}
function validateConfig(c){
 if(c.rewardGold){int(c.rewardGold.victory,0,10000);int(c.rewardGold.minute,0,1000);}
 if(c.dropTables){for(const [arena,row] of Object.entries(c.dropTables)){
  if(!ARENAS.includes(arena)&&arena!=='divina')fail('BAD_ARENA');
  if(!row||typeof row!=='object'||Array.isArray(row))fail('BAD_TABLE');
  let total=0;for(const [rarity,w] of Object.entries(row)){if(![...E().RARITIES,'set'].includes(rarity)||!Number.isFinite(w)||w<0||w>10000)fail('BAD_WEIGHT');total+=w;}
  if(total<=0)fail('EMPTY_TABLE');
 }}
}
function autoLoot(s,id){
 const a=s.accounts[id],cfg=a.autoLoot||{enabled:true,fuse:true,recycle:false},out={fused:0,materials:0};if(!cfg.enabled)return out;
 const groups=new Map();for(const it of Object.values(s.items)){
  if(it.owner!==id||it.favorite||it.listing||it.legacy||it.relicId||it.crafted||it.designed||it.set||it.level!==1||isEquipped(a,it.uid)||!['comun','raro'].includes(it.rarity))continue;
  const identity=JSON.stringify([it.type,it.rarity,it.value,it.roll,it.affixes,it.passives,it.legendProc||null,it.mythicPassive]);
  if(!groups.has(identity))groups.set(identity,[]);groups.get(identity).push(it);
 }
 for(const group of groups.values()){
  if(cfg.fuse)while(group.length>=3){const three=group.splice(0,3),it=generated(three[0].type,three[0].rarity==='comun'?'raro':'muyraro',id);three.forEach(x=>delete s.items[x.uid]);s.items[it.uid]=it;out.fused++;}
  if(cfg.recycle)while(group.length>1){delete s.items[group.pop().uid];a.materials++;out.materials++;}
 }return out;
}
module.exports={validateConfig,autoLoot,migrate,prepare,project,normalizeItem,generated,command:liveCommand,seasons,ranking,month,bounds,isEquipped,active,unlock};
