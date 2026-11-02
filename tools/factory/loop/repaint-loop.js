'use strict';
/* Lazo de repintado cuadro a cuadro: productor (Runway) ↔ arquitecto (frame_tools.py critic).
 *   PACKS=packs_full.json BUDGET=40 MAXROUNDS=4 node repaint-loop.js CHAMP FRAME OUTROOT
 * Cada ronda: genera con la referencia del Códice + el cuadro actual, post-procesa (croma, suelo, paleta), el arquitecto devuelve
 * feedback y la siguiente ronda agrega sus instrucciones al prompt. Se detiene al pasar el control automático (queda pendiente la
 * revisión visual independiente), al agotar MAXROUNDS o BUDGET (créditos de ESTA ejecución; nunca se recarga ni compra). */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),R=require('./runway.js');
const [champ,frame,root]=process.argv.slice(2),BUDGET=+process.env.BUDGET||40,MAX=+process.env.MAXROUNDS||4,MODEL=process.env.MODEL||'gen4_image_turbo',GEN=process.env.GEN||'1';     // GEN: generación (cambia al aplicar una devolución nueva del arquitecto)
const out=path.resolve(root,champ,'f'+frame),py=(...a)=>cp.execFileSync('python3',[path.join(__dirname,'frame_tools.py'),...a],{encoding:'utf8',env:{...process.env}});
const dl=url=>cp.execFileSync('curl',['-s','-m','90',url],{maxBuffer:1<<26});
(async()=>{fs.mkdirSync(out,{recursive:true});py('prep',champ,frame,out);const start=await R.balance();console.log('saldo API',start);
 const base='Repaint the character in @cur so it matches the exact character design shown in @ref'+(process.env.ANCHOR?' and @anchor (the approved final look: copy its face, colors and rendering style exactly)':'')+'  (same outfit, hair, weapon/staff, accessories and colors). Keep the pose of @cur: same stance, same size and position in the frame. Clean pixel art, hard pixel edges, no anti-aliasing, no shadow, no text, flat solid pure green #00FF00 background.';
 let extra='',best=null;const af=`${out}/architect_feedback.json`;                // devolución visual del arquitecto (CORREGIR + texto)
 if(fs.existsSync(af)){const a=JSON.parse(fs.readFileSync(af,'utf8'));if(a.verdict==='CORREGIR')extra='Corrections from the art director: '+a.negative_feedback;}
 for(let r=1;r<=MAX;r++){
  const spent=start-await R.balance();if(spent+(R.COST[MODEL]||5)>BUDGET){console.log('BUDGET agotado',spent);break;}
  const refs=['cur','ref'].concat(fs.existsSync(`${out}/anchor.b64`)?['anchor']:[]).map(t=>({uri:fs.readFileSync(`${out}/${t}.b64`,'utf8'),tag:t}));
  const g=await R.generate({model:MODEL,prompt:base+' '+extra,ratio:process.env.RATIO||'1024:1024',refs,journal:`${out}/journal.jsonl`,key:`${champ}-${frame}-g${GEN}r${r}`});
  fs.writeFileSync(`${out}/result_g${GEN}r${r}.png`,dl(g.output[0]));py('post',out,`${out}/result_g${GEN}r${r}.png`,`g${GEN}r${r}`);
  const fb=JSON.parse(py('critic',out,`g${GEN}r${r}`));best=fb;
  if(fb.verdict==='PASA_AUTOMATICO'){console.log('ronda',r,'pasa el control automático; falta revisión visual');break;}
  extra='Corrections from the reviewer: '+fb.prompt_fix;
 }
 console.log('gasto',start-await R.balance(),'créditos; último veredicto',best&&best.verdict);
})().catch(e=>{console.error(e.message);process.exit(1);});
