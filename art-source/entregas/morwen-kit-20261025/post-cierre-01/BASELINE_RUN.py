import runpy,threading,subprocess,os,time,urllib.request
from pathlib import Path
threading.Thread(target=lambda:runpy.run_path(str(Path(__file__).with_name('BASELINE_SERVER.py'))),daemon=True).start()
for i in range(50):
 try:urllib.request.urlopen('http://127.0.0.1:8807/index.html');break
 except Exception:time.sleep(.1)
os.environ.update(NODE_PATH='/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules',CHROMIUM_PATH='/tmp/chromium',SE_BASE_URL='http://127.0.0.1:8807')
raise SystemExit(subprocess.call(['node','tools/regression/t_champs_se.js','art-source/entregas/morwen-kit-20261025/post-cierre-01/libertador-main-baseline']))
