from pathlib import Path
from PIL import Image
import json, hashlib
P=Path(__file__).parent
specs=json.loads((P/'recipe.json').read_text())
report=[]
for s in specs:
    source=P/(s['key']+'-source.png');raw=source.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==s['source_sha256']
    im=Image.open(source).convert('RGBA');W,H=im.size
    N,C,R,Z=s['n'],s['cols'],s['rows'],s['cell']
    atlas=Image.new('RGBA',(N*Z,Z));preview=Image.new('RGBA',(C*Z,R*Z));frames=[]
    for i in range(C*R):
        x,y=i%C,i//C; box=(x*W//C,y*H//R,(x+1)*W//C,(y+1)*H//R)
        tile=im.crop(box);mask=tile.getchannel('A').point(lambda a:255 if a>=128 else 0);bbox=mask.getbbox()
        scale=min(Z/tile.width,Z/tile.height);size=(max(1,round(tile.width*scale)),max(1,round(tile.height*scale)))
        out=Image.new('RGBA',(Z,Z));out.paste(tile.resize(size,Image.Resampling.NEAREST),((Z-size[0])//2,(Z-size[1])//2))
        if i<N:atlas.paste(out,(i*Z,0))
        preview.paste(out,(x*Z,y*Z))
        frames.append({'frame':i,'intended':i<N,'source_crop':box,'bbox_alpha128':bbox,'nonempty':bbox is not None,'touches_edge':bool(bbox and (bbox[0]==0 or bbox[1]==0 or bbox[2]==tile.width or bbox[3]==tile.height))})
    atlas.save(P/(s['key']+'-diagnostic.png'));preview.save(P/(s['key']+'-preview.png'))
    a=im.getchannel('A');hist=a.histogram()
    report.append({'key':s['key'],'block':s['block'],'item':s['item'],'source_sha256':s['source_sha256'],'source_size':[W,H],'semi_alpha_pixels':sum(hist[1:255]),'transparent_pixels':hist[0],'opaque_pixels':hist[255],'expected_frames':N,'nonempty_candidates':sum(f['nonempty'] for f in frames if f['intended']),'reserved_nonempty':[f['frame'] for f in frames if not f['intended'] and f['nonempty']],'edge_frames':[f['frame'] for f in frames if f['intended'] and f['touches_edge']],'frames':frames,'status':'EN_CORRECCION','visual_pass':False,'integrated_main':False})
(P/'technical.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k!='frames'} for r in report],indent=2))
