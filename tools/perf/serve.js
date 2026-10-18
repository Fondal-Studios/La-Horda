// Servidor estático de MEDICIÓN (no es parte del juego). Imita un hosting estático típico (GitHub Pages):
// keep-alive, gzip para texto, ETag/304 y Cache-Control: max-age=600.
//   [MAXAGE=600] node tools/perf/serve.js [puerto=9317] [raiz=.]
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const PORT = +(process.argv[2] || 9317), ROOT = path.resolve(process.argv[3] || '.');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const TEXT = new Set(['.html', '.js', '.css', '.json', '.svg', '.webmanifest']);
const gz = new Map();
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); return res.end('404'); }
    const ext = path.extname(f), etag = '"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"';
    const h = { 'Content-Type': MIME[ext] || 'application/octet-stream', ETag: etag, 'Cache-Control': 'max-age=' + (process.env.MAXAGE || 600), 'Last-Modified': st.mtime.toUTCString() };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, h); return res.end(); }
    if (TEXT.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      let b = gz.get(etag + f);
      if (!b) { b = zlib.gzipSync(fs.readFileSync(f), { level: 6 }); gz.set(etag + f, b); }
      res.writeHead(200, { ...h, 'Content-Encoding': 'gzip', 'Content-Length': b.length }); return res.end(b);
    }
    res.writeHead(200, { ...h, 'Content-Length': st.size }); fs.createReadStream(f).pipe(res);
  });
}).listen(PORT, '127.0.0.1', () => console.log('serving ' + ROOT + ' on ' + PORT));
