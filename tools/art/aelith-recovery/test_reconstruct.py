import importlib.util,unittest,json,hashlib,tempfile,shutil,contextlib,io
from pathlib import Path
from PIL import Image
spec=importlib.util.spec_from_file_location('recover',Path(__file__).with_name('reconstruct.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class RecoveryTest(unittest.TestCase):
 def test_historical_atlas_exact_and_original_cells_preserved(self):
  m=json.loads((mod.OUT/'manifest.json').read_text());p=mod.ROOT/m['candidate']['path'];self.assertEqual(mod.sha(p.read_bytes()),mod.EXPECTED)
  old=Image.open(mod.ROOT/m['source']['path']).convert('RGBA');new=Image.open(p).convert('RGBA');self.assertEqual(new.size,(448,1120));self.assertEqual(new.crop((0,0,448,1008)).tobytes(),old.tobytes());self.assertEqual(new.crop((336,1008,448,1120)).tobytes(),old.crop((0,224,112,336)).tobytes())
 def test_normalization_reproduces_all_three_cells(self):
  m=json.loads((mod.OUT/'manifest.json').read_text());atlas=Image.open(mod.ROOT/m['candidate']['path']).convert('RGBA')
  for i,(name,task,expected) in enumerate(mod.TASKS):
   p=mod.OUT/'sources'/(task+'.png');self.assertEqual(mod.sha(p.read_bytes()),expected);cell=mod.normalize(p);self.assertEqual(cell.tobytes(),atlas.crop((i*112,1008,(i+1)*112,1120)).tobytes());self.assertEqual(set(cell.getchannel('A').tobytes()),{0,255});self.assertEqual(cell.getbbox()[3],107)
 def test_only_backcast_contract_and_path_change(self):
  m=json.loads((mod.OUT/'manifest.json').read_text());meta=json.loads(json.dumps(m['originalMeta']));meta['sets']['cast_up']=[36,37,38,39];self.assertEqual(meta,m['candidate']['meta']);self.assertEqual(m['newGenerationCalls'],0);self.assertEqual(m['newCreditsSpent'],0)
 def test_full_reconstruction_and_baseline_tamper_fail_closed(self):
  original_root,original_out=mod.ROOT,mod.OUT
  m=json.loads((original_out/'manifest.json').read_text())
  with tempfile.TemporaryDirectory() as t:
   root=Path(t)
   for key in ['source','registry','reference']:
    dest=root/m[key]['path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original_root/m[key]['path'],dest)
   reg=root/m['registry']['path'];lines=reg.read_text().splitlines();new=next(x for x in lines if x.startswith('champPackLoadAtlas("aelith",'));reg.write_text(reg.read_text().replace(new,m['originalLiteral']))
   out=root/'art-source/aelith-recovery-20261102';shutil.copytree(original_out/'sources',out/'sources')
   try:
    mod.ROOT,mod.OUT=root,out
    with contextlib.redirect_stdout(io.StringIO()):mod.main()
    self.assertEqual(mod.sha((root/m['candidate']['path']).read_bytes()),mod.EXPECTED)
    reg.write_text(reg.read_text()+'\n// unexpected registry drift\n')
    with self.assertRaisesRegex(mod.GateError,'refuse refreshed pins'):mod.main()
   finally:mod.ROOT,mod.OUT=original_root,original_out
if __name__=='__main__':unittest.main()
