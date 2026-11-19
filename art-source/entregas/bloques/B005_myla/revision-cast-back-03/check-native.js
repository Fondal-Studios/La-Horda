'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '../../../../..');
const source = fs.readFileSync(path.join(root, 'tools/art/pixel-density.js'), 'utf8');
function section(a,b) { const x=source.indexOf(a), y=source.indexOf(b); if(x<0||y<=x) throw Error('Canonical detector layout changed'); return source.slice(x,y); }
const context=vm.createContext({});
vm.runInContext(section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {'),context);
const input=path.join(__dirname,'cast.png');
const raw=execFileSync('python3',['-c','from PIL import Image; import sys; im=Image.open(sys.argv[1]); assert im.mode=="RGBA" and im.size==(112*12,112); assert set(im.getchannel("A").getdata()) <= {0,255}; sys.stdout.buffer.write(im.tobytes())',input]);
const rows=[];
for(let frame=0;frame<12;frame++) {
  const cell=new Uint8ClampedArray(112*112*4);
  for(let y=0;y<112;y++) cell.set(raw.subarray((y*112*12+frame*112)*4,(y*112*12+frame*112+112)*4),y*112*4);
  const metrics=context.analyzeInPage(cell,112,112,8);
  rows.push({frame,...metrics,...context.classify('campeones',metrics,0.85,'atlas.png')});
}
const failedFrames=rows.filter(r=>!r.opaque || r.issues.length).map(r=>r.frame);
const report={status:failedFrames.length?'FIX':'TECHNICAL_SCREEN_PASS',scope:'Canonical numerical detector only; not renderer or animation approval',scale:0.85,failedFrames,rows};
fs.writeFileSync(path.join(__dirname,'native-cast.json'),JSON.stringify(report,null,2)+'\n');
console.log(report.status, failedFrames);
if(failedFrames.length) process.exitCode=1;
