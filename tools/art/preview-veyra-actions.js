'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/veyra-codex-20261028/cierre-02');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
const page=await browser.newPage({viewport:{width:1560,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [name,source] of [['left-current','cierre-02/source-left-actions-attempt02.png'],['right-current','cierre-02/source-right-actions-attempt01.png'],['left-original','produccion-01/source-left.png'],['left-previous','cierre-01/source-left-attempt02.png']]){
await page.goto(site.url+'/art-source/entregas/veyra-codex-20261028/'+source);
await page.evaluate(async()=>{const im=document.querySelector('img');await im.decode();const c=document.createElement('canvas');c.id='review';c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.fillStyle='#26302c';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0);document.body.replaceChildren(c);document.body.style.margin='0';});
const png=await page.locator('#review').evaluate(c=>c.toDataURL());fs.writeFileSync(path.join(OUT,'alpha-review-'+name+'.png'),Buffer.from(png.split(',')[1],'base64'));
}
fs.writeFileSync(path.join(OUT,'PREVIEW_CHECK.json'),JSON.stringify({errors,mode:'Browser source alpha composited on opaque green; diagnostic only; no extraction or gameplay approval'},null,2)+'\n');console.log(JSON.stringify({errors}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
