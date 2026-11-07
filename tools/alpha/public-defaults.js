'use strict';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('js/storage/save.js','utf8');
const body=source.slice(source.indexOf('function laHordaPrivateHost('),source.indexOf('// PEDIDO DEL USUARIO',source.indexOf('function laHordaDevMode()')));
// Modo dev: solo localhost y redes PRIVADAS (autorizado por el propietario para probar en el teléfono por Wi-Fi); nunca dominios ni IPs públicas.
const DEV_HOSTS=['localhost','127.0.0.1','[::1]','192.168.1.25','10.0.0.5','172.16.0.1','172.31.255.1','mi-compu.local'];
for(const hostname of ['fondalstudios.com','drmarianojimenez94-sudo.github.io','8.8.8.8','172.15.0.1','172.32.0.1','192.169.1.1','evil.local.com',...DEV_HOSTS]){
 const data=new Map([['laHordaDev','1']]);const c=vm.createContext({window:{},URLSearchParams,location:{hostname,search:'?dev=1'},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}});
 vm.runInContext(body,c);assert.equal(vm.runInContext('laHordaDevMode()',c),DEV_HOSTS.includes(hostname));
 c.window.__campaignMode=true;assert.equal(vm.runInContext('laHordaDevMode()',c),false);
}
const portadores=fs.readFileSync('js/data/portadores.js','utf8');assert(!/unlockedByDefault\s*:\s*true/.test(portadores));
console.log('PASS public URLs cannot grant dev progression; localhost debugging preserved; new champions locked by default');
