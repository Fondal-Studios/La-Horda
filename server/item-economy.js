'use strict';
/* Authoritative economic ledger; legacy migration is performed once from the stored save. */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const DAY = 86400000;
const RARITIES = ['comun','raro','muyraro','legendario','mitico','unico'];
const SLOTS = ['arma','escudo','casco','pechera','guantes','botas'];
const RANKS = ['Aprendiz','Oficial','Artesano','Experto','Maestro Forjador'];
const SETS = ['lucifer','glaciar','coloso','tempestad','alba'];
const RELICS = [
  ['marea_primigenia','Corazón de la Marea','acuatica','escudo','hit_shield','El último latido del mar sostiene a quien no se rinde.'],
  ['hilo_sin_fin','Hilo sin Fin','laberinto','botas','combo_ramp','El primer caminante dejó este hilo para volver a casa.'],
  ['corona_abismo','Corona del Abismo','abismo','casco','skill_nova','Una corona que recuerda a quienes miraron hacia abajo.'],
  ['ascua_cerbero','Ascua de Cerbero','minas','guantes','kill_explode','Tres guardianes custodiaron una única chispa.'],
  ['ultimo_juramento','Último Juramento','infernal','arma','kill_heal','El juramento sobrevivió incluso a quien lo pronunció.']
].map(([id,name,arena,type,legendProc,lore])=>({id,name,arena,type,legendProc,lore,method:'Recompensa de jefe validada por el servidor; emisión única.',image:'assets/ui/skill-icons/nova-de-escarcha.png'}));
const copy = x => JSON.parse(JSON.stringify(x));
function fail(code,status=400){const e=new Error(code);e.status=status;throw e;}
function integer(v,min=0,max=1000000000){if(!Number.isSafeInteger(v)||v<min||v>max)fail('INVALID_INTEGER');return v;}
function key(v){if(typeof v!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(v)||['__proto__','constructor','prototype'].includes(v))fail('INVALID_KEY');return v;}
function own(o,k){return Object.hasOwn(o,k);}
let catalogCache;
function catalog(){
  if(catalogCache)return catalogCache;
  const ctx=vm.createContext({});
  for(const name of ['items','sets','mythic-sets-v2'])vm.runInContext(fs.readFileSync(path.join(__dirname,`../js/data/${name}.js`),'utf8'),ctx,{timeout:1000});
  const source=vm.runInContext('({sets:SET_DB,items:DESIGNED_ITEMS,values:RARITY_VALUES})',ctx);
  const recipes={};
  for(const type of SLOTS)recipes[`basic_${type}`]={id:`basic_${type}`,name:`${type} de aprendiz`,type,rarity:'comun',rank:0,gold:300,material:4,xp:10,blueprint:false,value:source.values[type].comun};
  for(const id of SETS)for(const type of SLOTS){
    const rid=`${id}_${type}`,set=source.sets[id];
    recipes[rid]={id:rid,name:set.pieces[type]||`${type} · ${set.name}`,type,rarity:'mitico',set:id,lore:set.lore,rank:3,gold:25000,material:150,xp:100,blueprint:true,value:source.values[type].mitico};
  }
  catalogCache={recipes,sets:SETS.map(id=>({id,name:source.sets[id].name,lore:source.sets[id].lore,pieces:SLOTS.map(type=>`${id}_${type}`)}))};
  return catalogCache;
}
function initial(){return {schema:1,version:0,accounts:{},items:{},listings:{},relics:Object.fromEntries(RELICS.map(r=>[r.id,{...r,image:'assets/ui/skill-icons/nova-de-escarcha.png',uid:`relic_${r.id}`,owner:null,status:'undiscovered',history:[],originalWinner:null}])),seasons:{},receipts:{},audit:[],config:{inactiveDays:14,warnDays:10,feeBps:500,forgeCostScale:1,vendorsEnabled:false},vendorDay:{}};}
function account(s,id,now){
  const k=String(integer(Number(id),1));
  if(!own(s.accounts,k))s.accounts[k]={gold:0,materials:0,rank:0,xp:0,challenges:[],blueprints:[],cosmetics:[],lastSeen:now};
  return s.accounts[k];
}
function audit(s,actor,action,details,now){s.version++;s.audit.push({seq:s.version,actor,action,at:now,...details});}
function itemOf(s,id,owner){key(id);const it=s.items[id];if(!it||it.owner!==owner)fail('NOT_OWNED',403);return it;}
function spend(a,gold,material=0){integer(gold);integer(material);if(a.gold<gold||a.materials<material)fail('INSUFFICIENT_RESOURCES',409);a.gold-=gold;a.materials-=material;}
function credit(a,amount){a.gold=integer(a.gold+integer(amount));}
function collection(s,owner){const a=s.accounts[owner];for(const set of catalog().sets){if(set.pieces.every(id=>Object.values(s.items).some(it=>it.owner===owner&&it.designId===id))&&!a.cosmetics.includes(set.id))a.cosmetics.push(set.id);}}
function transfer(s,it,to,reason,now){
  it.owner=to; delete it.listing; it.equipped=false; it.favorite=false;
  if(it.relicId){const r=s.relics[it.relicId];r.owner=to;r.acquiredAt=now;r.status=to===null?'vault':'owned';r.history.push({owner:to,name:to===null?'Bóveda':s.accounts[to]?.names||to,reason,at:now});}
  if(to!==null){collection(s,to);require('./item-economy-live').unlock(s,to);}
}
function sweep(s,now){
  for(const r of Object.values(s.relics)){
    if(r.owner===null)continue;
    const a=s.accounts[r.owner];if(!a)fail('CORRUPT_OWNER',500);
    const away=now-Math.max(a.lastSeen,r.acquiredAt||0);
    if(away>=s.config.warnDays*DAY){a.notices=a.notices||[];const key=r.id+':'+a.lastSeen;if(!a.notices.some(n=>n.key===key))a.notices.push({key,at:now,text:`Ausencia de ${s.config.warnDays} días: ${r.name} se recupera a los ${s.config.inactiveDays} días. Iniciar sesión renueva el plazo.`});}
    if(away<s.config.inactiveDays*DAY)continue;
    const it=s.items[r.uid];if(!it)fail('CORRUPT_RELIC',500);
    if(it.listing){const listing=s.listings[it.listing];if(listing?.state==='open')listing.state='reclaimed';}
    transfer(s,it,null,'inactivity',now);audit(s,'server','relic.reclaimed',{relic:r.id},now);
  }
}
function invariant(s){
  for(const a of Object.values(s.accounts)){integer(a.gold);integer(a.materials);integer(a.rank,0,4);}
  for(const r of Object.values(s.relics)){
    const copies=Object.values(s.items).filter(it=>it.relicId===r.id);
    if(copies.length>(r.status==='undiscovered'?0:1))fail('DUPLICATE_RELIC',500);
    if(r.status!=='undiscovered'&&(copies.length!==1||copies[0].uid!==r.uid||copies[0].owner!==r.owner))fail('CORRUPT_RELIC',500);
  }
  for(const l of Object.values(s.listings))if(l.state==='open'){
    const it=s.items[l.item];if(!it||it.owner!==l.seller||it.listing!==l.id)fail('CORRUPT_ESCROW',500);
  }
}
function command(s,actor,op,b,now,rng=()=>crypto.randomInt(1000000)/1000000){
  const owner=String(actor.id),a=account(s,owner,now);
  const live=require('./item-economy-live');const handled=live.command(s,actor,op,b,now);if(handled!==undefined)return handled;
  if(['craft','upgrade','refine','rank','list'].includes(op)&&live.active(s,owner,now))fail('RUN_ACTIVE',409);
  if(op==='presence'){a.lastSeen=now;return {ok:true};}
  if(op==='favorite'){const it=itemOf(s,b.item,owner);if(it.listing)fail('IN_ESCROW');it.favorite=b.value===true;return {item:it};}
  if(op==='craft'){
    key(b.recipe);const r=catalog().recipes[b.recipe];if(!r)fail('UNKNOWN_RECIPE');
    if(a.rank<r.rank||r.blueprint&&!a.blueprints.includes(r.id))fail('RECIPE_LOCKED',403);
    spend(a,Math.ceil(r.gold*s.config.forgeCostScale),r.material);
    const uid=crypto.randomUUID();const value=r.value*(0.95+0.05*rng());
    const it={uid,designId:r.id,name:r.name,type:r.type,rarity:r.rarity,set:r.set||null,value,level:1,passives:[],roll:1,mythicPassive:null,owner,creator:actor.user,crafted:true,favorite:false,affixes:[]};
    // Master selects at most two attributes; the third remains random. Caps are server constants.
    const effects=['dmg_mult','hp_mult','speed_mult','heal_mult','cd_mult'];
    const choices=b.attributes===undefined?[]:b.attributes;
    if(!Array.isArray(choices)||choices.length>2||new Set(choices).size!==choices.length||choices.some(x=>!effects.includes(x))||choices.length&&a.rank!==4)fail('INVALID_ATTRIBUTES');
    it.affixes=[...choices,effects[Math.floor(rng()*effects.length)]].map(effect=>({id:({dmg_mult:'afx_dmg',hp_mult:'afx_hp',speed_mult:'afx_speed',heal_mult:'afx_heal',cd_mult:'afx_cdr'})[effect],v:0.01+0.02*rng()}));
    s.items[uid]=it;a.xp=integer(a.xp+r.xp);collection(s,owner);live.unlock(s,owner);return {item:it};
  }
  if(op==='upgrade'){
    const it=itemOf(s,b.item,owner);if(it.listing||it.favorite||it.relicId)fail('PROTECTED_ITEM');
    if(it.level>=10)fail('MAX_LEVEL');
    const advanced=it.level>=4;if(advanced&&a.rank<2)fail('RANK_LOCKED');
    spend(a,Math.ceil(300*it.level*it.level*s.config.forgeCostScale),it.level*3);
    const success=!advanced||rng()<Math.min(0.95,0.45+a.rank*0.1);
    if(success)it.level++;a.xp=integer(a.xp+5);return {item:it,success};
  }
  if(op==='refine'){
    const it=itemOf(s,b.item,owner);if(it.listing||it.favorite||it.relicId)fail('PROTECTED_ITEM');
    if(a.rank<2)fail('RANK_LOCKED');integer(b.index,0,it.affixes.length-1);
    spend(a,Math.ceil(2500*s.config.forgeCostScale),20);it.affixes[b.index].v=0.01+0.02*rng();return {item:it};
  }
  if(op==='rank'){
    if(a.rank>=4)fail('MAX_RANK');const next=a.rank+1;
    if(a.xp<[0,200,1000,4000,12000][next]||!a.challenges.includes(`forge_${next}`))fail('CHALLENGE_REQUIRED');
    spend(a,[0,2000,10000,40000,100000][next],next*25);a.rank=next;return {rank:a.rank};
  }
  if(op==='list'){
    const it=itemOf(s,b.item,owner);if(it.favorite||require('./item-economy-live').isEquipped(a,it.uid)||it.listing)fail('PROTECTED_ITEM');if(it.legacy)fail('LEGACY_NOT_TRADABLE',403);integer(b.price,1,100000000);
    if(Object.values(s.listings).filter(l=>l.seller===owner&&l.state==='open').length>=20)fail('LISTING_LIMIT');
    const id=crypto.randomUUID();s.listings[id]={id,item:it.uid,seller:owner,price:b.price,feeBps:s.config.feeBps,state:'open',at:now};it.listing=id;return {listing:s.listings[id]};
  }
  if(op==='cancel'){
    key(b.listing);const l=s.listings[b.listing];if(!l||l.seller!==owner||l.state!=='open')fail('LISTING_UNAVAILABLE',409);
    delete s.items[l.item].listing;l.state='cancelled';return {ok:true};
  }
  if(op==='buy'){
    key(b.listing);const l=s.listings[b.listing];if(!l||l.state!=='open'||l.seller===owner)fail('LISTING_UNAVAILABLE',409);
    const it=itemOf(s,l.item,l.seller);spend(a,l.price);
    const fee=Math.ceil(l.price*l.feeBps/10000);credit(account(s,l.seller,now),l.price-fee);
    transfer(s,it,owner,'auction',now);l.state='sold';l.buyer=owner;l.fee=fee;l.closedAt=now;return {item:it,fee};
  }
  fail('UNKNOWN_OPERATION');
}
function admin(s,actor,op,b,now){
  if(op==='config'){
    if(!b.config||typeof b.config!=='object'||Array.isArray(b.config))fail('BAD_CONFIG');
    for(const k of Object.keys(b.config))if(!['inactiveDays','warnDays','feeBps','forgeCostScale','dropTables','rewardGold'].includes(k))fail('BAD_CONFIG');
    const c={...s.config,...b.config};if(b.config.dropTables)c.dropTables={...s.config.dropTables,...b.config.dropTables};integer(c.inactiveDays,2,365);integer(c.warnDays,1,c.inactiveDays-1);integer(c.feeBps,0,3000);
    if(!Number.isFinite(c.forgeCostScale)||c.forgeCostScale<0.1||c.forgeCostScale>100)fail('BAD_CONFIG');require('./item-economy-live').validateConfig(c);s.config=c;return {config:c};
  }
  if(op==='grant'){
    const target=String(integer(b.userId,1)),a=account(s,target,now);
    // Administrative grants are audited, idempotent, never accepted from game clients.
    credit(a,integer(b.gold||0));a.materials=integer(a.materials+integer(b.materials||0));
    if(b.blueprint){key(b.blueprint);if(!catalog().recipes[b.blueprint]?.blueprint)fail('UNKNOWN_BLUEPRINT');if(!a.blueprints.includes(b.blueprint))a.blueprints.push(b.blueprint);}
    if(b.challenge){if(!/^forge_[1-4]$/.test(b.challenge))fail('UNKNOWN_CHALLENGE');if(!a.challenges.includes(b.challenge))a.challenges.push(b.challenge);}
    return {account:a};
  }
  if(op==='relic'){
    key(b.relic);const r=s.relics[b.relic];if(!r)fail('UNKNOWN_RELIC');
    if(!['undiscovered','vault'].includes(r.status))fail('RELIC_ALREADY_OWNED',409);
    if(Object.values(s.seasons).some(season=>season.relic===r.id&&!season.closed))fail('SEASON_RESERVED',409);
    const target=String(integer(b.userId,1));account(s,target,now);
    if(!s.items[r.uid])s.items[r.uid]={uid:r.uid,relicId:r.id,name:r.name,type:r.type,rarity:'unico',legendProc:r.legendProc,level:1,owner:null,affixes:[],value:require('./item-economy-live').generated(r.type,'mitico',null).value};
    transfer(s,s.items[r.uid],target,'gm.release',now);return {relic:r};
  }
  if(op==='season'){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month))fail('BAD_MONTH');key(b.relic);
    const start=Date.parse(b.month+'-01T00:00:00Z');if(start<now)fail('SEASON_ALREADY_STARTED');
    const r=s.relics[b.relic];if(!r||!['vault','undiscovered'].includes(r.status)||Object.values(s.seasons).some(x=>x.relic===b.relic&&!x.closed)||s.seasons[b.month])fail('PRIZE_UNAVAILABLE',409);
    const date=new Date(start);date.setUTCMonth(date.getUTCMonth()+1);
    s.seasons[b.month]={month:b.month,relic:b.relic,start,end:date.getTime(),closed:false,results:[]};return {season:s.seasons[b.month]};
  }
  // No score-submission/award endpoint until a trusted match verifier exists.
  fail('UNKNOWN_OPERATION');
}
function view(s,owner,now){
  const a=s.accounts[owner]||null;
  return {version:s.version,account:a,items:Object.values(s.items).filter(it=>it.owner===owner),catalog:catalog(),ranks:RANKS,
    listings:Object.values(s.listings).filter(l=>l.state==='open').map(l=>({...l,item:s.items[l.item]})),
    relics:Object.values(s.relics).map(r=>({...r,ownerName:r.owner?s.accounts[r.owner]?.names||r.owner:null})),seasons:Object.values(s.seasons),config:s.config,
    warning:a&&now-a.lastSeen>=s.config.warnDays*DAY?'Tus reliquias pasarán a la Bóveda al cumplir el plazo de inactividad.':null,
    readiness:{campaignRewards:true,combatEquipment:true,monthlyAwards:true,legacyMigration:true,vendors:false,legacyQuestRewards:false,authoritativeCombatSimulation:false},projection:require('./item-economy-live').project(s,owner,{champions:Object.fromEntries(Object.keys(a?.equipment||{}).map(k=>[k,{}]))}),champions:s.champions||[]};
}
function routes(ctx){
  const {getStore,auth,send,err,readBody,now,isOwner}=ctx,result={},fallback=ctx.fallback||{};
  function route(method,url,ownerOnly,fn){result[method+' '+url]=async(req,res)=>{
    try{
      if(process.env.HORDA_ITEM_ECONOMY==='0')fail('ECONOMY_NOT_ENABLED',503);
      const a=await auth(req);if(!a.user)fail('NO_SESSION',401);if(ownerOnly&&!isOwner(a.user))fail('FORBIDDEN',403);
      const store=getStore();if(!store?.persistent)fail('PERSISTENT_STORAGE_REQUIRED',503);
      const body=method==='GET'?{}:await readBody(req,16384);
      const value=await store.gmUpdate(async raw=>{
        const root=raw||require('./game-master').stateOf(null);const s=root.itemEconomy||initial();root.itemEconomy=s;
        const stamp=now();const live=require('./item-economy-live');live.seasons(s,stamp);sweep(s,stamp);await live.migrate(s,a.user,store,stamp);
        const value=await fn(s,a.user,body,stamp);invariant(s);return {state:root,value:{...value,snapshot:view(s,String(a.user.id),stamp)}};
      });send(req,res,200,value);
    }catch(e){if(e.status)return err(req,res,e.status,e.message,e.message);throw e;}
  };}
  route('GET','/api/economy',false,(s,u,b,t)=>view(s,String(u.id),t));
  for(const [url,isAdmin] of [['/api/economy/action',false],['/api/gm/economy/action',true]])route('POST',url,isAdmin,async(s,u,b,t)=>{
    key(b.requestId);if(typeof b.op!=='string'||! /^[a-z]+(?:\.[a-z]+)?$/.test(b.op))fail('INVALID_OPERATION');if(!isAdmin&&b.op==='run.pulse')return command(s,u,b.op,b.args||{},t);const ref=`${u.id}:${b.requestId}`,fingerprint=JSON.stringify({admin:isAdmin,op:b.op,args:b.args||{}});
    if(own(s.receipts,ref)){const old=s.receipts[ref];if(old.fingerprint!==fingerprint)fail('IDEMPOTENCY_CONFLICT',409);return old.value;}
    if(Object.keys(s.receipts).length>=100000)fail('LEDGER_CAPACITY',503);
    if(isAdmin&&['grant','relic'].includes(b.op)&&!await getStore().getUser(integer(b.args?.userId,1)))fail('USER_NOT_FOUND',404);
    const value=(isAdmin?admin:command)(s,u,b.op,b.args||{},t);
    audit(s,u.id,(isAdmin?'gm.':'')+b.op,{requestId:b.requestId},t);s.receipts[ref]={fingerprint,value:copy(value)};return value;
  });
  route('GET','/api/gm/economy',true,s=>({audit:s.audit,config:s.config,accounts:s.accounts,items:s.items,listings:s.listings,relics:s.relics,seasons:s.seasons}));
  if(process.env.HORDA_ITEM_ECONOMY!=='0'){
  result['GET /api/leaderboard']=async(req,res,...rest)=>{
    try{
    const store=getStore();if(!store?.persistent){if(fallback['GET /api/leaderboard'])return fallback['GET /api/leaderboard'](req,res,...rest);return err(req,res,503,'PERSISTENT_STORAGE_REQUIRED','El ranking requiere almacenamiento persistente.');} // sin almacenamiento persistente: ranking anterior, sin cambios
    const a=req.headers.authorization?await auth(req):{};
    const value=await store.gmUpdate(async raw=>{const root=raw||require('./game-master').stateOf(null),s=root.itemEconomy||(root.itemEconomy=initial()),live=require('./item-economy-live');live.seasons(s,now());sweep(s,now());const qs=new URL(req.url,'http://x').searchParams,k=qs.get('week')||live.month(now());if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k))fail('BAD_MONTH');return {state:root,value:live.ranking(s,k,String(a.user?.id||''),qs.get('guardian'))};});send(req,res,200,value);
    }catch(e){if(e.status)return err(req,res,e.status,e.message,e.message);throw e;}
  };
  result['POST /api/leaderboard/submit']=async(req,res,...rest)=>{if(!getStore()?.persistent&&fallback['POST /api/leaderboard/submit'])return fallback['POST /api/leaderboard/submit'](req,res,...rest);req.resume();err(req,res,409,'RUN_RECEIPT_REQUIRED','El puntaje se registra al cerrar una partida verificada por el servidor.');};
  }
  return result;
}
async function tick(store,now){if(process.env.HORDA_ITEM_ECONOMY==='0'||!store?.persistent)return;await store.gmUpdate(raw=>{const root=raw||require('./game-master').stateOf(null),s=root.itemEconomy||(root.itemEconomy=initial());require('./item-economy-live').seasons(s,now);sweep(s,now);invariant(s);return {state:root,value:null};});}
async function recordLogin(store,user,now){
  if(process.env.HORDA_ITEM_ECONOMY==='0'||!store?.persistent)return;
  await store.gmUpdate(async raw=>{
    const root=raw||require('./game-master').stateOf(null);
    const s=root.itemEconomy||(root.itemEconomy=initial());require('./item-economy-live').seasons(s,now);sweep(s,now);await require('./item-economy-live').migrate(s,user,store,now);account(s,user.id,now).lastSeen=now;
    invariant(s);return {state:root,value:null};
  });
}
module.exports={tick,routes,initial,command,admin,sweep,invariant,catalog,view,recordLogin,audit,transfer,RARITIES,SLOTS,RANKS,SETS,RELICS};
