// Public assets only. Server code, data, tests and secrets never enter the CDN bundle.
import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const relay = new URL(process.env.GAME_RELAY_URL || 'wss://fondalstudios.com/la-horda/red');
if(relay.protocol !== 'wss:' || relay.username || relay.password || relay.search || relay.hash)
  throw new Error('GAME_RELAY_URL must be a public wss:// URL without credentials or query');
await mkdir(out, {recursive:true});
for(const name of ['assets','css','js','index.html','instalar.html','crystal-wars.html','manifest.webmanifest'])
  await cp(path.join(root,name),path.join(out,name),{recursive:true});
const configFile=path.join(out,'js/net/net-config.js');
const config=await readFile(configFile,'utf8');
if(!/serverUrl:\s*"[^"]*"/.test(config))throw new Error('Missing relay config');
await writeFile(configFile,config.replace(/serverUrl:\s*"[^"]*"/,'serverUrl: '+JSON.stringify(relay.href.replace(/\/$/,''))));
if(process.env.GAME_SITE_URL){
  const site=new URL(process.env.GAME_SITE_URL);
  if(site.protocol!=='https:'||site.username||site.password)throw new Error('Invalid public site URL');
  const html=await readFile(path.join(out,'index.html'),'utf8');
  await writeFile(path.join(out,'index.html'),html.replaceAll('https://fondalstudios.com/la-horda/jugar/',site.href.endsWith('/')?site.href:site.href+'/'));
}
await writeFile(path.join(out,'deployment.json'),JSON.stringify({revision:process.env.RENDER_GIT_COMMIT||null,relay:relay.href,builtAt:new Date().toISOString()},null,2));
console.log('Static game built in dist with relay '+relay.href);
