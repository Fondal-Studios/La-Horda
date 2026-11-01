from pathlib import Path
import importlib.util,json,numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[2];O=R/'art-source/entregas/ilkan-codex-20261029/produccion-01'
s=importlib.util.spec_from_file_location('style',R/'tools/art/painter/style_gate.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
refs,ranges=m.reference();a=np.array(Image.open(O/'candidate-atlas.png'));rows=[]
for i in range(62):
 f=a[i//8*128:(i//8+1)*128,i%8*192:(i%8+1)*192];v=m.measure(f);rows.append({'index':i,'metrics':v,'failures':m.check(v,ranges) if v else ['empty']})
# Existing painter gate judges median locomotion metrics, not individual action extrema.
meta=json.loads((O/'candidate-meta.json').read_text());ids=sum([meta['sets'][k] for k in ['walk_down','walk_side','walk_up']],[]);med={k:float(np.median([rows[i]['metrics'][k] for i in ids])) for k in ranges};fail=m.check(med,ranges)
res={'scope':'Same painter measurements/tolerance; explicit native 192x128 cells; median of 12 locomotion slots. Individual action rows diagnostic, not standard 448x1008 gate.','tolerance':m.TOL,'references':refs,'ranges':ranges,'locomotionMedian':med,'failures':fail,'frames':rows}
(O/'STYLE.json').write_text(json.dumps(res,indent=2)+'\n');print(json.dumps({'median':med,'failures':fail,'individualFailures':sum(bool(r['failures']) for r in rows)}))
