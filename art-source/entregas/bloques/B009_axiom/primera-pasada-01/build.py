from pathlib import Path
from PIL import Image
import hashlib, json
p=Path(__file__).parent
src=p/'source.png'
im=Image.open(src).convert('RGBA')
assert im.size==(1659,948)
atlas=Image.new('RGBA',(232*28,232))
preview=Image.new('RGBA',(232*7,232*4))
frames=[]
for i in range(28):
    x,y=i%7*237,i//7*237
    f=im.crop((x,y,x+237,y+237)).resize((232,232),Image.Resampling.NEAREST)
    a=f.getchannel('A'); box=a.point(lambda v:255 if v>=128 else 0).getbbox()
    frames.append({'frame':i,'bbox_alpha128':box,'nonempty':box is not None,'edge':bool(box and (box[0]==0 or box[1]==0 or box[2]==232 or box[3]==232))})
    atlas.paste(f,(i*232,0));preview.paste(f,(i%7*232,i//7*232))
atlas.save(p/'forcequit-diagnostic.png');preview.save(p/'preview.png')
report={'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_size':im.size,'grid':[7,4],'source_cell':237,'diagnostic_cell':232,'alpha_preserved':True,'semi_alpha_pixels':sum(0<a<255 for a in im.getchannel('A').getdata()),'frames':frames,'nonempty':sum(f['nonempty'] for f in frames),'state':'EN_CORRECCION','runtime_approved':False}
(p/'technical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='frames'}))
