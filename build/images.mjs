// Converts previews/*.png to webp (900w + 450w), copies the Inter font, makes icons.
// Run: node build/images.mjs  (needs sharp + @fontsource-variable/inter installed)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, 'rocketscienceme.github.io');
const SRC = path.join(ROOT, 'previews');
const OUT = path.join(SITE, 'assets/img/preview');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(SITE, 'assets/fonts'), { recursive: true });

const dims = {};
for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.png'))) {
  const base = f.replace('.png', '');
  for (const w of [900, 450]) {
    const out = path.join(OUT, `${base}-${w}.webp`);
    const info = await sharp(path.join(SRC, f)).resize({ width: w }).webp({ quality: w === 450 ? 78 : 80 }).toFile(out);
    dims[`${base}-${w}`] = `${info.width}x${info.height} ${(info.size / 1024).toFixed(1)}KB`;
  }
}
console.log(dims);

// Font (OFL): latin subset, variable weight
const require = createRequire(process.env.TOOLS_DIR + '/package.json');
const fontDir = path.dirname(require.resolve('@fontsource-variable/inter/package.json'));
fs.copyFileSync(path.join(fontDir, 'files/inter-latin-wght-normal.woff2'), path.join(SITE, 'assets/fonts/inter-latin-wght-normal.woff2'));
fs.copyFileSync(path.join(fontDir, 'LICENSE'), path.join(SITE, 'assets/fonts/LICENSE-Inter-OFL.txt'));

// Icons
const iconSvg = fs.readFileSync(path.join(SITE, 'assets/img/favicon.svg'));
await sharp(iconSvg, { density: 600 }).resize(180, 180).png().toFile(path.join(SITE, 'assets/img/apple-touch-icon.png'));
await sharp(iconSvg, { density: 300 }).resize(32, 32).png().toFile(path.join(SITE, 'favicon.png'));
console.log('done');
