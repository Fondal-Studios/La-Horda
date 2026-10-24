'use strict';
// Overflow chunks are outside the equipment stash and survive its legacy 5000-item sanitizer.
function rewardOverflowPush(item, target){
  const s=target||save, chunks=s.rewardOverflow||(s.rewardOverflow=[]);
  if(!chunks.length||chunks[chunks.length-1].length>=100)chunks.push([]);
  chunks[chunks.length-1].push(item);
}
function rewardOverflowCount(){return (save.rewardOverflow||[]).reduce((n,c)=>n+c.length,0);}
function rewardOverflowClaim(){
  const chunks=save.rewardOverflow||[];let count=0;
  while(chunks.length&&!stashFull()){
    const it=chunks[0][0];
    if(it&&!findStashItem(it.uid)){stashItems().push(it);count++;}
    chunks[0].shift();if(!chunks[0].length)chunks.shift();
  }
  return {count,saved:persistNow()};
}
function rewardReview(){
 const overlay=document.createElement('div');overlay.id='reward-mailbox';
 overlay.style.cssText='position:fixed;inset:0;z-index:20000;background:#100c08ee;overflow:auto;padding:24px;color:#ffe8b3';
 const title=document.createElement('h2');title.textContent='Recompensas pendientes';overlay.append(title);
 const note=document.createElement('p');note.textContent=`${rewardOverflowCount()} objetos en el buzón. Se recuperan cuando hay lugar en el inventario.`;overlay.append(note);
 const entries=Object.values(save.victoryReceipts||{}).filter(r=>!r.reviewed);
 for(const r of entries){
  const p=document.createElement('p');p.textContent=`${r.data.arena}: ${(r.data.rewards||[]).map(it=>it.name||it.uid).join(', ') || 'Recompensas guardadas'}`;overlay.append(p);
 }
 const list=document.createElement('ol');
 let offset=0;const items=(save.rewardOverflow||[]).flat();
 const more=document.createElement('button');more.className='btn';more.textContent='Ver más objetos';
 const page=()=>{for(const it of items.slice(offset,offset+50)){const li=document.createElement('li');li.textContent=it.name||it.uid;list.append(li);}offset+=50;more.hidden=offset>=items.length;};
 overlay.append(list,more);more.onclick=page;page();
 const claim=document.createElement('button');claim.className='btn';claim.textContent='Pasar al inventario';claim.onclick=()=>{const r=rewardOverflowClaim();note.textContent=r.saved?`${r.count} recuperados; quedan ${rewardOverflowCount()}.`:'No se pudo guardar. Reintentá antes de cerrar el juego.';};overlay.append(claim);
 const recover=document.createElement('button');recover.className='btn';recover.textContent='Buscar partidas desconectadas';recover.onclick=async()=>{
  try{await netConnect();campaignInboxOpen();note.textContent='Consultando al servidor…';CampaignInbox.show=()=>{note.textContent=`${CampaignInbox.ids.length} partidas disponibles para recuperar.`;recover.textContent='Recuperar siguiente partida';recover.onclick=()=>{if(CampaignInbox.ids.length){overlay.remove();netSend({t:'reward-get',id:CampaignInbox.ids[0]});}};};}
  catch(e){note.textContent='No se pudo conectar. Las entregas pendientes siguen en el servidor.';}
 };overlay.append(recover);
 const close=document.createElement('button');close.className='btn';close.textContent='Confirmar y cerrar';close.onclick=()=>{
  for(const r of entries){r.reviewed=true;save.victoryReceipts[r.id]={id:r.id,reviewed:true};}
  if(persistNow()){overlay.remove();campaignMailboxButton();}else note.textContent='No se pudo guardar. Reintentá antes de cerrar.';
 };overlay.append(close);document.body.append(overlay);
}
function campaignMailboxButton(){
 const host=document.getElementById('mainmenu-screen');if(!host)return;
 let b=document.getElementById('reward-mailbox-btn');
 if(!b){b=document.createElement('button');b.id='reward-mailbox-btn';b.className='btn';b.onclick=rewardReview;host.append(b);}
 b.textContent=`Recompensas pendientes (${rewardOverflowCount()})`;
}
const CampaignInbox={ids:[],show:null,protocol:false};
function campaignInboxOpen(){
 try{
  const user=typeof accountState==='function'?accountState().user:null;
  const scope='horda_reward_key:'+netServerUrl()+':'+(user||'anonymous');
  let key=localStorage.getItem(scope);
  if(!/^[a-f0-9]{64}$/.test(key||'')){key=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');localStorage.setItem(scope,key);}
  netSend({t:'reward-open',key});
 }catch(e){ /* no durable browser capability available; account identity can still reconnect normally */ }
}
function campaignInboxMessage(m){
 if(m.t==='reward-list'){
  CampaignInbox.protocol=true;
  CampaignInbox.ids=(m.ids||[]).filter(id=>!Object.values(save.victoryReceipts||{}).some(r=>r.id.startsWith(id+':')));
  if(CampaignInbox.show)CampaignInbox.show();return true;
 }
 if(m.t==='reward-committed'){if(netMatch)netMatch.rewardPending=false;return true;}
 if(m.t!=='reward-result')return false;
 const r=m.result;
 if(!r||typeof r.id!=='string'||!r.start||!r.end||!r.end.victory)return true;
 const champ=r.start.slots?.[r.slot]?.champ;
 const id=r.start.rewardRunId+':'+r.start.arena+':'+champ;
 if(save.victoryReceipts?.[id]){if(persistNow())netSend({t:'reward-ack',id:r.id});return true;}
 if(netInRoom()||['playing','paused','buff'].includes(state))return true; // never replace an active run
 const oldSlot=net.slot,oldCode=net.code;
 try{
  net.slot=r.slot;net.code=null;
  netGuestStartRun({...r.start,snap:{...r.end.snap,c:{},v:[],p:[]}});
  // Transient particles/events must not award live XP/gold a second time during replay.
  netGuestEnd({...r.end,snap:null});
  if(saveLastWriteOK)netSend({t:'reward-ack',id:r.id});
 }finally{netMatch=null;net.slot=oldSlot;net.code=oldCode;}
 renderVictoryStep();return true;
}
