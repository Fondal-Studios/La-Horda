'use strict';
// Transport adapter only: run the EXISTING strict Ability Gate on public code in a fresh guest.
const {chromium}=require('playwright'),path=require('node:path');
process.env.ABILITY_BASE_URL='https://fondalstudios.com/la-horda/jugar';
process.env.ONLY='solciju,brakk,veyra,morveth,aelith';
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch({...options,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
 const newContext=browser.newContext.bind(browser),close=browser.close.bind(browser);let blockedWrites=0;
 browser.newPage=async options=>{
  const context=await newContext({...options,serviceWorkers:'block',ignoreHTTPSErrors:process.env.PUBLIC_SMOKE_ALLOW_PROXY_TLS==='1'});
  await context.route('**/*',route=>{
   const r=route.request();if(!['GET','HEAD'].includes(r.method())){blockedWrites++;return route.abort();}
   return new URL(r.url()).origin==='https://fondalstudios.com'?route.continue():route.abort();
  });
  const page=await context.newPage();await page.routeWebSocket('**',ws=>ws.close());return page;
 };
 browser.close=async()=>{await close();console.log('READ_ONLY_TRANSPORT '+JSON.stringify({blockedWrites,webSocketsBlocked:true,isolatedProxyTlsBypass:process.env.PUBLIC_SMOKE_ALLOW_PROXY_TLS==='1'}));};
 return browser;
};
require(path.resolve('tools/bible/ability-gate.js'));
