from pathlib import Path
from PIL import Image,ImageDraw
import json,gzip,shutil
p=Path('art-source/entregas/myla-bubble-20261026/cierre-01');out=p/'review';out.mkdir(exist_ok=True)
arenas=['bosque','hielo','infernal','laberinto','acuatica','minas'];looks=['base','gear','set','skin','tier4']
def crop(f,w=220,h=160):
 im=Image.open(f);cx=im.width//2;cy=int(im.height*.55);return im.crop((cx-w//2,cy-h//2,cx+w//2,cy+h//2))
for vp in ['mobile','desktop']:
 for arena in arenas:
  sheet=Image.new('RGB',(880,900),'#20242b');d=ImageDraw.Draw(sheet)
  for row,look in enumerate(looks):
   for col,(density,mode)in enumerate([('sparse','parent'),('sparse','before'),('dense','parent'),('dense','before')]):
    f=p/('final-'+vp)/f'{arena}-{look}-{density}-h2-640-{mode}.png';sheet.paste(crop(f),(col*220,row*180+20));d.text((col*220+3,row*180+3),f'{arena}/{look}/{density}/{mode}',fill='white')
  sheet.save(out/f'{vp}-{arena}.png')
 for look in ['base','skin']:
  sheet=Image.new('RGB',(880,540),'#20242b');d=ImageDraw.Draw(sheet)
  for i,t in enumerate(range(125,1501,125)):
   f=p/('temporal-'+vp)/f'infernal-{look}-sparse-h2-{t}-before.png';sheet.paste(crop(f),(i%4*220,i//4*180+20));d.text((i%4*220+3,i//4*180+3),f'{vp}/{look}/{t}ms',fill='white')
  sheet.save(out/f'temporal-{vp}-{look}.png')
 for mode in ['before','parent']:
  f=p/('final-'+vp)/f'acuatica-skin-sparse-h2-640-{mode}.png';shutil.copyfile(f,out/f'full-{vp}-{mode}.png')
summary={}
for name in ['mobile','desktop','final-mobile','final-desktop','temporal-mobile','temporal-desktop','canary','open-pilot']:
 f=p/name/'capture.json';j=json.loads(f.read_text());a=[(r,x)for r in j['rows']for x in r['ab']];summary[name]={'scenes':len(j['rows']),'samples':len(a),'minimumRetention':min(x['visible'] for r,x in a),'contactFailures':sum(x['visible']<.8 for r,x in a),'exactABA':sum(x['restore'] and x['state'] for r,x in a),'parentStateEqual':sum(x['parentState'] for r,x in a),'errors':j['errors'],'looks':sorted(set(r['look'] for r in j['rows']))}
 (p/(name+'.json.gz')).write_bytes(gzip.compress(f.read_bytes(),mtime=0))
summary['scope']='80% bodies/delta24 unchanged. A/B/A restores body poses, RNG, particles, SFA and family pools/rings/seen/lastT and per-object _famT. Parent uses exact original my_bubble_idle native recipe and alpha.8 while keeping same scenario, other runtime identical; no whole-main renderer swap. Parent/candidate actor state identical. Damage800ms, aggregate refill1200ms; temporal runs no damage. No global-state certification.'
(p/'MATRIX_SUMMARY.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
