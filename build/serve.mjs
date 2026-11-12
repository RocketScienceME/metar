// Tiny static server for the site folder (mimics GitHub Pages: /dir/ -> /dir/index.html, 404.html)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const SITE = path.resolve(import.meta.dirname, '../rocketscienceme.github.io');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
export function serve(port = 8123) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(SITE, p);
    if (!f.startsWith(SITE)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    let status = 200;
    if (!fs.existsSync(f)) { f = path.join(SITE, '404.html'); status = 404; }
    res.writeHead(status, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(port, () => r(server)));
}
if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) serve().then(() => console.log('http://localhost:8123/metar/'));
