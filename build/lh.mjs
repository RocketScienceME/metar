// Lighthouse (mobile, default simulated slow 4G) on each page: node build/lh.mjs
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { serve } from './serve.mjs';
const server = await serve(8126);
const chrome = await chromeLauncher.launch({ chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromeFlags: ['--headless=new'] });
for (const p of ['/metar/', '/', '/privacy/', '/terms/']) {
  const r = await lighthouse('http://localhost:8126' + p, { port: chrome.port, output: 'json', logLevel: 'error' });
  const lhr = r.lhr, c = lhr.categories, a = lhr.audits;
  const s = k => Math.round(c[k].score * 100);
  console.log(`${p}  perf ${s('performance')}  a11y ${s('accessibility')}  bp ${s('best-practices')}  seo ${s('seo')}  | LCP ${a['largest-contentful-paint'].displayValue}  CLS ${a['cumulative-layout-shift'].displayValue}  TBT ${a['total-blocking-time'].displayValue}  transfer ${Math.round(a['total-byte-weight'].numericValue / 1024)}KB`);
  for (const [k, cat] of Object.entries(c)) for (const ref of cat.auditRefs) {
    const au = a[ref.id]; if (ref.weight > 0 && au.score !== null && au.score < 0.9) console.log(`   - [${k}] ${au.id}: ${au.title} ${au.displayValue || ''}`);
  }
  if (p === '/metar/' && process.env.DEBUG) {
    console.log(JSON.stringify(a['mainthread-work-breakdown'].details.items.map(i => [i.group, Math.round(i.duration)])));
    console.log(JSON.stringify((a['long-tasks'].details?.items || []).map(i => [i.url, Math.round(i.duration), Math.round(i.startTime)])));
    console.log(JSON.stringify(a['bootup-time'].details.items.map(i => [i.url, Math.round(i.total), Math.round(i.scripting)])));
  }
  if (p === '/metar/') {
    const items = a['network-requests'].details.items;
    const nonHero = items.filter(i => !i.url.includes('01-cover')).reduce((t, i) => t + i.transferSize, 0);
    console.log(`   first-view transfer excluding hero image: ${(nonHero / 1024).toFixed(1)}KB (${items.length} requests)`);
  }
}
await chrome.kill(); server.close();
