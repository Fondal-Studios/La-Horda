import base64,json,subprocess,time,sys
from PIL import Image
S='/tmp/claude-0/-home-user-La-Horda/04ed236b-bf09-5381-92a8-80b49408a753/scratchpad/'
def green(p,o):
    im=Image.open(p).convert('RGBA'); bg=Image.new('RGBA',im.size,(0,255,0,255)); bg.alpha_composite(im); bg.convert('RGB').save(o)
    return 'data:image/png;base64,'+base64.b64encode(open(o,'rb').read()).decode()
r1=green('assets/sprites/enemies/hielo/golem_cristal/atlas.png',S+'r1.png')
r2=green('assets/sprites/enemies/hielo/golem_hielo/static.png',S+'r2.png')
P=("Pixel art animation sprite sheet for a video game, same pixel art style as @style. Character: the stone and ice golem from @style, identical design in every cell. "
"Grid of 4 rows and 6 columns of equal cells on a flat chroma green #00FF00 background, character centered, same size, feet on the same line. "
"Row 1: walking cycle, 6 frames, legs alternating, front view. "
"Row 2: punching animation, 6 frames, arms raised then lowered. "
"Row 3: idle breathing 3 frames, then stumbling backward 3 frames. "
"Row 4: collapsing animation, 6 frames, golem slowly crumbling into a heap of stones. "
"No shadow, no text, no grid lines.")
body={"model":"gen4_image","ratio":"1280:720","promptText":P,"referenceImages":[{"uri":r1,"tag":"style"}]}
H=['-H','X-Runway-Version: 2024-11-06','-H','Content-Type: application/json']
def api(m,r,b=None):
    a=['curl','-sS','-m','120','-X',m,'https://api.dev.runwayml.com/v1'+r,*H]
    if b: a+=['-d','@-']
    return json.loads(subprocess.run(a,input=json.dumps(b).encode() if b else None,capture_output=True).stdout)
t=api('POST','/text_to_image',body); print(t)
for _ in range(60):
    r=api('GET','/tasks/'+t['id'])
    if r['status'] in('SUCCEEDED','FAILED','CANCELLED'):break
    time.sleep(4)
print(r['status'],r.get('failure'),r.get('cost'))
if r['status']=='SUCCEEDED': subprocess.run(['curl','-sS','-o',S+'sheet_golem.png',r['output'][0]])
