'use strict';
// Seguridad: nombre/skin/campeón de otro jugador no pueden inyectar atributos ni elementos en la sala (net-lobby.js, relay.js clean).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const rd=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const lobby=rd('js/net/net-lobby.js'), relay=rd('server/relay.js'), guide=rd('js/ui/champion-guide.js');
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+1);assert(i>=0&&j>i,a);return s.slice(i,j);};
const PAYLOAD='"><img src=x onerror=alert(1)>';
// 1) clean del relay
const clean=vm.runInNewContext(cut(relay,'function clean(','function publicRoom')+';clean');
const c=clean(PAYLOAD+"a'b`c",80);
assert(!/["'<>`]/.test(c),'clean debe quitar comillas, apóstrofes, < y >: '+c);
assert.equal(clean(null,5),''); assert.equal(clean('abcdefgh',3),'abc');
// 2) render de la sala
const code=[cut(guide,'function guideEsc','function championGuideHTML'),cut(lobby,'function netKnownSkin','function netHostBroadcastCos'),
  cut(lobby,'function netRenderLobbySlots','function netSendLoadout'),'function _netCommitHTML(el,key){el.innerHTML=el._next;}'].join('\n');
const slotsEl={};
const ctx={document:{getElementById:id=>id==='lobby-slots'?slotsEl:null},
  CLASSES:{guerrero:{name:'G',color:'#fff',roleCategory:'tanque'}},SET_SKINS:{bosque:{name:'Bosque'}},CROMA_SKINS:{},
  skinDefOf:id=>({bosque:{name:'Bosque'}})[id]||null,NET_SLOT_COLORS:['#1','#2','#3','#4'],NET_ROLE_LABEL:{},
  champSkinId:()=>'',selectedClass:'guerrero',save:{champions:{guerrero:{level:1}}},
  startChampAnimLoop(){},netDuplicateChamps:()=>[],netNotReady:()=>[],netHumanCount:()=>2,ARENA_MODS:{},currentArena:'x',
  net:{slot:0,role:'host',room:{slots:[{champ:'guerrero',level:1,connected:true,name:'host'},{champ:PAYLOAD,level:2,connected:true,name:PAYLOAD,ready:true},null,null]}},
  netLobby:{loadouts:{1:{skin:PAYLOAD}},cos:{}}};
vm.createContext(ctx); vm.runInContext(code,ctx);
vm.runInContext('netRenderLobbySlots()',ctx);
const html=slotsEl.innerHTML;
assert(html && html.length>100,'no renderizó');
assert(!/<img/i.test(html),'se coló un <img>');
assert(!/onerror\s*=/i.test(html.replace(/&quot;|&lt;|&gt;/g,'')) || !/<[^>]*onerror/i.test(html),'atributo inyectado');
assert.equal((html.match(/<canvas/g)||[]).length,2);
assert(/data-skin=""/.test(html),'skin desconocida debe quedar vacía');
// skin válida y claves de prototipo
assert.equal(vm.runInContext('netKnownSkin("bosque")',ctx),'bosque');
for(const bad of ['constructor','__proto__','toString',PAYLOAD,'']) assert.equal(vm.runInContext('netKnownSkin('+JSON.stringify(bad)+')',ctx),null,bad);
ctx.net.role='guest'; ctx.netLobby.cos={1:'bosque'};
assert.equal(vm.runInContext('netSlotSkin(1)',ctx),'bosque');
ctx.netLobby.cos={1:'"onload="x'}; assert.equal(vm.runInContext('netSlotSkin(1)',ctx),null);
console.log('PASS net-lobby-injection');
