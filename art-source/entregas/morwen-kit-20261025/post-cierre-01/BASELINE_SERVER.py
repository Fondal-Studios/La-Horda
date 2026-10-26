import http.server,os
from pathlib import Path
os.chdir(Path(__file__).resolve().parents[4])
class H(http.server.SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path.split('?')[0]=='/js/skills/champion-signatures.js':
   b=open('art-source/entregas/morwen-kit-20261025/primera-pasada-01/signatures-before.js','rb').read();self.send_response(200);self.send_header('Content-Type','application/javascript');self.end_headers();self.wfile.write(b)
  else:super().do_GET()
 def log_message(self,*a):pass
http.server.ThreadingHTTPServer(('127.0.0.1',8807),H).serve_forever()
