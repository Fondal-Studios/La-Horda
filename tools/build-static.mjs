// Public assets only. Server code, data, tests and secrets never enter the CDN bundle.
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const relay = new URL(process.env.GAME_RELAY_URL || 'wss://fondalstudios.com/la-horda/red');
if(relay.protocol !== 'wss:' || relay.username || relay.password || relay.search || relay.hash)
  throw new Error('GAME_RELAY_URL must be a public wss:// URL without credentials or query');
await mkdir(out, {recursive:true});
for(const name of ['assets','css','js','index.html','instalar.html','crystal-wars.html','manifest.webmanifest','sw.js'])
  await cp(path.join(root,name),path.join(out,name),{recursive:true});
const configFile=path.join(out,'js/net/net-config.js');
const config=await readFile(configFile,'utf8');
if(!/serverUrl:\s*"[^"]*"/.test(config))throw new Error('Missing relay config');
await writeFile(configFile,config.replace(/serverUrl:\s*"[^"]*"/,'serverUrl: '+JSON.stringify(relay.href.replace(/\/$/,''))));
const coreFile=path.join(out,'js/net/net-core.js');
const core=await readFile(coreFile,'utf8');
await writeFile(coreFile,core.replace('if(value==="wss://fondalstudios.com/la-horda/red")',
  'if(value==='+JSON.stringify(relay.href.replace(/\/$/,''))+')').replace('FONDAL · ALPHA PRINCIPAL','LA HORDA · ALPHA PRINCIPAL'));
if(process.env.GAME_SITE_URL){
  const site=new URL(process.env.GAME_SITE_URL);
  if(site.protocol!=='https:'||site.username||site.password)throw new Error('Invalid public site URL');
  const html=await readFile(path.join(out,'index.html'),'utf8');
  await writeFile(path.join(out,'index.html'),html.replaceAll('https://fondalstudios.com/la-horda/jugar/',site.href.endsWith('/')?site.href:site.href+'/'));
}
// OPCIONAL (GAME_PERF=1): paquetes de scripts (~360 pedidos -> ~25) + service worker con caché por hash.
// Va después de las reescrituras de arriba porque los hashes se calculan sobre lo que realmente se publica.
if(process.env.GAME_PERF==='1'){
  const {execFileSync}=await import('node:child_process');
  execFileSync('node',[path.join(root,'tools/perf/bundle.js'),'--root',out,'--out',out,'--html','index.html'],{stdio:'inherit'});
  execFileSync('node',[path.join(root,'tools/perf/stamp-sw.js'),out],{stdio:'inherit'});
}
await writeFile(path.join(out,'deployment.json'),JSON.stringify({revision:process.env.RENDER_GIT_COMMIT||null,relay:relay.href,builtAt:new Date().toISOString()},null,2));
console.log('Static game built in dist with relay '+relay.href);
