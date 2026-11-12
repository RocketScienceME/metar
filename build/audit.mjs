// Text audit: numbers, forbidden claims, sitemap, placeholders. node build/audit.mjs
import fs from 'node:fs';
import path from 'node:path';
const SITE = path.resolve(import.meta.dirname, '../rocketscienceme.github.io');
const files = ['index.html', 'metar/index.html', 'privacy/index.html', 'terms/index.html', '404.html'];
const text = f => fs.readFileSync(path.join(SITE, f), 'utf8');
const visible = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// 1. Every number-with-unit claim on the sales page
const sales = visible(text('metar/index.html'));
const claims = {};
for (const m of sales.matchAll(/\b(\d+)[- ](page|pages|chapters|practice reports|reports|codes|most common mistakes|question|step|row|ICAO METARs|US and Canadian METARs|TAFs|examples)\b/gi)) {
  const k = `${m[1]} ${m[2].toLowerCase()}`; claims[k] = (claims[k] || 0) + 1;
}
console.log('Number claims on /metar/:', claims);

// 2. Forbidden phrases anywhere (visible text + meta + JSON-LD)
const forbidden = /100% correct|error-free|guaranteed accurate|testimonial|rating|\bstars?\b|bestsell|sold out|only \d+ left|limited time|countdown|as seen on|thousands of|licensed pilot|airline pilot|certified instructor|\bCFI\b|\bATPL\b/gi;
for (const f of files) {
  const hits = [...visible(text(f)).matchAll(forbidden)].map(m => m[0]);
  const raw = [...text(f).matchAll(/aggregateRating|"review"/g)].map(m => m[0]);
  console.log(`forbidden in ${f}:`, hits.length || raw.length ? [...hits, ...raw] : 'none');
}

// 3. Title / description lengths
for (const f of files) {
  const h = text(f);
  const t = (h.match(/<title>(.*?)<\/title>/) || [])[1]?.replace(/&amp;/g, '&');
  const d = (h.match(/name="description" content="(.*?)"/) || [])[1]?.replace(/&amp;/g, '&');
  console.log(`${f}: title ${t.length} chars, description ${d.length} chars`);
}

// 4. Sitemap well-formed-ish
const sm = text('../rocketscienceme.github.io/sitemap.xml');
console.log('sitemap urls:', (sm.match(/<loc>/g) || []).length, 'lastmod:', (sm.match(/<lastmod>/g) || []).length, sm.includes('urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"') ? 'ns ok' : 'ns MISSING');

// 5. Placeholders
const ph = {};
for (const f of [...files, 'README.md']) for (const m of text(f).matchAll(/\{\{([A-Z0-9_]+)\}\}/g)) { if (f === 'README.md') continue; (ph[m[1]] ||= new Set()).add(f); }
console.log('\nPLACEHOLDERS STILL TO FILL (' + Object.keys(ph).length + '):');
for (const [k, v] of Object.entries(ph).sort()) console.log(`  {{${k}}}  ->  ${[...v].join(', ')}`);

// 6. Write visible text for the spell checker
fs.writeFileSync(path.join(process.env.SHOTS_DIR || '.', 'visible.txt'), files.map(f => visible(text(f))).join('\n'));
