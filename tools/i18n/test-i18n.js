'use strict';
// Prueba del selector de idioma: ?lang=, persistencia, botón del hub, selector de Opciones, cambio en caliente y vuelta a español sin residuos.
const H=require('../lib/serve');
const fail=[];const ok=(c,m)=>{if(!c){fail.push(m);console.log('FAIL',m);}else console.log('ok  ',m);};
(async()=>{const site=await H.startSite(),browser=await H.launch();
 try{
  const ctx=await browser.newContext({viewport:{width:1100,height:640},locale:'es-AR'});
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const boot=async q=>{await page.goto(site.url+'/index.html'+q+(q?'&':'?')+'lazy=0');await page.waitForFunction(()=>typeof setState==='function'&&typeof assetsAllReady==='function'&&assetsAllReady(),null,{timeout:120000});};
  await boot('');
  ok(await page.evaluate(()=>I18N.lang)==='es','español por defecto con navegador es-AR');
  ok(await page.evaluate(()=>document.documentElement.lang)==='es','<html lang> = es');
  await page.evaluate(()=>{renderMainMenu();setState('mainmenu');});await page.waitForTimeout(300);
  await page.evaluate(()=>document.getElementById('hub-options')?.classList.remove('hidden'));await page.waitForTimeout(200);const spanish=await page.evaluate(()=>document.body.innerText);await page.evaluate(()=>document.getElementById('hub-options')?.classList.add('hidden'));
  const sel=await page.$('#hub-lang-btn');ok(!!sel,'botón de idioma en el menú principal');
  // ciclo ES→EN→PT con el botón
  await page.click('#hub-lang-btn');await page.waitForTimeout(300);
  ok(await page.evaluate(()=>I18N.lang)==='en','el botón pasa a inglés');
  ok(await page.evaluate(()=>localStorage.getItem('horda_lang'))==='en','se guarda la elección');
  const en=await page.evaluate(()=>document.body.innerText);ok(en!==spanish,'el texto del menú cambia en inglés');
  await page.click('#hub-lang-btn');await page.waitForTimeout(300);
  ok(await page.evaluate(()=>I18N.lang)==='pt','el botón pasa a portugués');
  ok(await page.evaluate(()=>document.documentElement.lang)==='pt','<html lang> = pt');
  // Opciones
  const opt=await page.evaluate(()=>{const s=document.getElementById('opt-lang');return s?[...s.options].map(o=>o.value).join(','):'';});
  ok(opt==='es,en,pt','selector en Opciones con es/en/pt ('+opt+')');
  await page.evaluate(()=>document.getElementById('hub-options')?.classList.remove('hidden'));await page.selectOption('#opt-lang','es');await page.waitForTimeout(300);
  ok(await page.evaluate(()=>I18N.lang)==='es','Opciones vuelve a español');
  const back=await page.evaluate(()=>document.body.innerText);const A=spanish.split('\n'),B=back.split('\n');const diff=B.filter(l=>!A.includes(l)).slice(0,5);if(diff.length)console.log('dif:',JSON.stringify(diff));ok(diff.length===0,'al volver a español no queda texto traducido ni cambiado');
  // persistencia y ?lang=
  { // tooltips de talentos (cabeza + «Sinergias»): una línea de sinergia, varias y la forma «por punto en A, B y C»
    await page.evaluate(()=>I18N.setLang('en'));await page.waitForFunction(()=>I18N.lang==='en',null,{timeout:20000});
    const syn=await page.evaluate(()=>[I18N.t('Acero Calado — La Bayoneta hace más daño. Sinergias: · cada punto da +5% daño a Carga de San Lorenzo (ahora +10%)'),I18N.t('Cadena de Relámpago — Salta entre enemigos Sinergias: +3% daño por punto en Combustión y Terreno Ardiente (ahora +9%)'),I18N.t('Aguante — x. Sinergias: · cada punto da +5% daño a A (ahora +10%) · cada punto da +2% escudo a B (ahora +4%)')]);
    ok(/Synergies/.test(syn[0])&&/each point gives \+5% damage to/.test(syn[0])&&/now \+10%/.test(syn[0])&&!/cada punto|Sinergias/.test(syn[0]),'talento: sinergia simple '+syn[0]);
    ok(/per point in/.test(syn[1])&&/and/.test(syn[1])&&!/por punto/.test(syn[1]),'talento: «por punto en A y B» '+syn[1]);
    ok(/shield to B/.test(syn[2])&&/damage to A/.test(syn[2])&&!/cada punto/.test(syn[2]),'talento: dos sinergias encadenadas '+syn[2]);
  }
  await page.evaluate(()=>I18N.setLang('pt'));await page.waitForFunction(()=>I18N.lang==='pt');await boot('');
  ok(await page.evaluate(()=>I18N.lang)==='pt','la elección persiste al recargar');
  await boot('?lang=en');ok(await page.evaluate(()=>I18N.lang)==='en','?lang=en manda sobre lo guardado');
  // números: plantillas {n} conservan los valores
  const t=await page.evaluate(()=>I18N.t('Vida 3/10'));ok(t==='Health 3/10','plantilla numérica: '+t);
  await page.evaluate(()=>I18N.setLang('pt'));await page.waitForFunction(()=>I18N.lang==='pt',null,{timeout:20000});const p=await page.evaluate(()=>{return I18N.t('Ilkan, el Caminante de Dunas · colección');});ok(/coleção/.test(p)&&/Caminhante/.test(p),'patrón de colección PT: '+p);
  // canvas
  const cv=await page.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');let out='';const o=c.fillText;c.fillText('Pausa',0,0);return c.measureText('Pausar partida').width>0;});ok(cv,'canvas sigue midiendo texto traducido');
  ok(errs.length===0,'sin errores de página '+errs.slice(0,2));
  await ctx.close();
 }finally{await browser.close();await site.close();}
 console.log(fail.length?'FALLAS: '+fail.length:'TODO OK');process.exitCode=fail.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
