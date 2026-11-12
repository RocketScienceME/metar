// Minifies build/style.css -> rocketscienceme.github.io/assets/css/style.css
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..');
let css = fs.readFileSync(path.join(ROOT, 'build/style.css'), 'utf8');
css = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .replace(/\band\(/g, 'and (')        // keep media query syntax valid
  .trim();
const out = path.join(ROOT, 'rocketscienceme.github.io/assets/css/style.css');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, css + '\n');
console.log('style.css', (css.length / 1024).toFixed(1) + 'KB');
