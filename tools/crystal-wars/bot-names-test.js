'use strict';
/* Dos bots con el mismo rol en el simulador de Cristales reciben nombres distintos (clave por bot: rol + puesto). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..');
const c={Math,console};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'js/ai/bot-identity.js'),'utf8')+';this.botNameFor=botNameFor;',c);
// misma lógica que client.js begin(): cada bot se nombra con 'cw-'+rol+'-'+puesto y se suma a los tomados
const heroes=[{bot:false,name:'Yo',role:'tank'},{bot:true,role:'mage'},{bot:true,role:'mage'},{bot:true,role:'mage'},{bot:true,role:'tank'}];
for(let run=0;run<50;run++){
  const taken=heroes.filter(h=>!h.bot).map(h=>h.name);
  heroes.forEach((h,i)=>{if(h.bot){h.name=c.botNameFor('cw-'+h.role+'-'+i,taken);taken.push(h.name);}});
  const names=heroes.map(h=>h.name.toLowerCase());
  assert.equal(new Set(names).size,names.length,'nombres repetidos: '+names.join(', '));
}
const src=fs.readFileSync(path.join(root,'js/modes/crystal-wars/client.js'),'utf8');
assert(/botNameFor\('cw-'\+h\.role\+'-'\+i/.test(src),'client.js usa una clave por bot');
console.log('PASS bot names: dos bots del mismo rol tienen nombres distintos');
