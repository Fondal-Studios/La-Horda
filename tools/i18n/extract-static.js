'use strict';
// Extrae literales de texto en español de js/**, server/*.js (mensajes) y html legales → docs/i18n/static-strings.json
// Solo cadenas "de frase" (>=2 palabras o con tilde/ñ/¿¡), sin código. Los números se normalizan a {n}.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'../..');
const skipDir=/(^|\/)(i18n|node_modules|vendor)(\/|$)/;
function walk(d,o=[]){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(!skipDir.test(path.relative(ROOT,p)))walk(p,o);}else if(/\.(js|html)$/.test(f.name))o.push(p);}return o;}
const files=[...walk(path.join(ROOT,'js')),...walk(path.join(ROOT,'legal')).filter(()=>true)].filter(f=>fs.existsSync(f));
const re=/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
const es=/[áéíóúñÁÉÍÓÚÑ¿¡]|\b(el|la|los|las|de|del|que|con|para|por|un|una|tu|tus|se|su|sus|al|en|y|o|no|más|cada|sin|sobre|hasta|cuando|como)\b/i;
const code=/^(?:[#.\w-]+|https?:|\/|data:|[\w.]+\([^)]*\)|[a-z]+[A-Z]\w*)$/;
const out=new Map();
for(const f of files){const src=fs.readFileSync(f,'utf8');let m;while((m=re.exec(src))){let s=m[1]??m[2]??m[3];if(s==null)continue;
 s=s.replace(/\\n/g,'\n').replace(/\\(["'`\\])/g,'$1');
 if(m[3]!=null&&/\$\{/.test(s))s=s.replace(/\$\{[^}]*\}/g,'{n}');
 const t=s.trim();if(t.length<4||t.length>1200)continue;if(code.test(t))continue;if(/[{};=]|=>|\bfunction\b|\breturn\b/.test(t.replace(/\{n\}/g,'')))continue;
 if(!/[A-Za-zÁÉÍÓÚÑáéíóúñ]{3}/.test(t))continue;if(!es.test(t))continue;
 if(!/\s/.test(t)&&!/[áéíóúñÁÉÍÓÚÑ]/.test(t))continue;
 const k=t.replace(/\d+(?:[.,]\d+)*/g,'{n}');if(!out.has(k))out.set(k,path.relative(ROOT,f));}}
const list=[...out.keys()].sort();
fs.writeFileSync(path.join(ROOT,'docs/i18n/static-strings.json'),JSON.stringify({count:list.length,strings:list,src:Object.fromEntries(out)},null,0));
console.log(list.length);
