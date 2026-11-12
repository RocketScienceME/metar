// Renders the OG image and runs the quality checks.
// node build/check.mjs  (needs puppeteer-core + a local Chrome)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { serve } from './serve.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, 'rocketscienceme.github.io');
const SHOTS = process.env.SHOTS_DIR || path.join(ROOT, 'build/shots');
fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ORIGIN = 'http://localhost:8123';
const server = await serve(8123);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const report = [];
const log = (...a) => { console.log(...a); report.push(a.join(' ')); };

// ---------- OG image ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on('request', r => r.url().endsWith('/__og')
    ? r.respond({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(ROOT, 'build/og.html'), 'utf8') })
    : r.continue());
  await page.goto(ORIGIN + '/__og', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(SITE, 'assets/img/og-image.png') });
  await page.close();
  log('og-image.png written');
}

// ---------- Layout, network, storage ----------
const pages = ['/metar/', '/', '/privacy/', '/terms/', '/does-not-exist'];
for (const url of pages) {
  for (const width of [360, 768, 1280]) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
    const requests = [];
    page.on('request', r => requests.push(r.url()));
    await page.goto(ORIGIN + url, { waitUntil: 'networkidle0' });
    // scroll through the page to trigger lazy images and reveals
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    });
    await new Promise(r => setTimeout(r, 900));
    const res = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > de.clientWidth + 1 || r.left < -1)) {
          // ignore things inside a horizontally scrollable wrapper, skip link, sr-only, hidden sticky bar
          if (el.closest('.table-wrap,.skip,.sr-only,.sticky-cta:not(.show),dialog')) return;
          over.push(el.tagName + '.' + el.className + ' ' + Math.round(r.right));
        }
      });
      return {
        scrollW: de.scrollWidth, clientW: de.clientWidth, over: over.slice(0, 5),
        cookies: document.cookie, ls: (() => { try { return localStorage.length; } catch { return 'n/a'; } })(),
        ss: (() => { try { return sessionStorage.length; } catch { return 'n/a'; } })(),
        h1: document.querySelectorAll('h1').length,
      };
    });
    const foreign = requests.filter(u => !u.startsWith(ORIGIN) && !u.startsWith('data:'));
    const cookies = await page.cookies();
    log(`${url} @${width}: hscroll=${res.scrollW > res.clientW ? 'YES ' + res.scrollW : 'no'} overflow=${res.over.length ? JSON.stringify(res.over) : 'none'} requests=${requests.length} foreign=${foreign.length ? foreign.join(',') : 0} cookies=${cookies.length}${res.cookies ? '+js' : ''} localStorage=${res.ls} sessionStorage=${res.ss} h1=${res.h1}`);
    const name = (url === '/' ? 'hub' : url.replace(/\//g, '') || 'x') + '-' + width;
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
    await ctx.close();
  }
}

// ---------- Sticky bar behaviour (mobile) ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 740 });
  await page.goto(ORIGIN + '/metar/', { waitUntil: 'networkidle0' });
  const at = async (sel) => {
    await page.evaluate(s => { const el = s === 'top' ? null : document.querySelector(s); window.scrollTo(0, el ? el.getBoundingClientRect().top + scrollY - 100 : 0); }, sel);
    await new Promise(r => setTimeout(r, 500));
    return page.evaluate(() => document.querySelector('.sticky-cta').classList.contains('show'));
  };
  log(`sticky bar: top=${await at('top')} sample=${await at('#sample')} faq=${await at('#faq')} finalCTA=${await at('#get')} footer=${await at('.site-footer')}`);
  // overlap check at the very bottom: footer last line must be above the bar or the bar hidden
  await page.close();
}

// ---------- Links and anchors ----------
{
  const files = ['index.html', 'metar/index.html', 'privacy/index.html', 'terms/index.html', '404.html'];
  const bad = [];
  for (const f of files) {
    const html = fs.readFileSync(path.join(SITE, f), 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
      for (let u of m[1].split(',').map(s => s.trim().split(' ')[0])) {
        if (u.startsWith('{{') || u.startsWith('mailto:{{') || u.startsWith('http') || u.startsWith('data:')) continue;
        if (u.startsWith('#')) { if (!ids.has(u.slice(1))) bad.push(f + ' -> ' + u); continue; }
        let p = path.join(SITE, u.split('#')[0]);
        if (u.endsWith('/')) p = path.join(p, 'index.html');
        if (!fs.existsSync(p)) bad.push(f + ' -> ' + u);
      }
    }
    // JSON-LD
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { const j = JSON.parse(m[1]); log(`${f}: JSON-LD ok (${(j['@graph'] || [j]).map(x => x['@type']).join(', ')})`); }
      catch (e) { bad.push(f + ' JSON-LD: ' + e.message); }
    }
  }
  log('broken internal links/anchors/JSON:', bad.length ? bad.join(' | ') : 'none');
}

// ---------- Contrast ----------
{
  const L = h => { const c = h.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const pairs = [
    ['ink on bg', '0b0b0b', 'fcfcfb'], ['ink-2 on bg', '52514e', 'fcfcfb'], ['ink-2 on alt', '52514e', 'f4f3ef'], ['ink-2 on sky', '52514e', 'e4edf9'],
    ['link blue on bg', '1d63b8', 'fcfcfb'], ['link blue on alt', '1d63b8', 'f4f3ef'], ['blue-text on sky', '1d63b8', 'e4edf9'],
    ['eyebrow orange on bg', 'b2410f', 'fcfcfb'], ['eyebrow orange on alt', 'b2410f', 'f4f3ef'], ['badge orange on #fdf0ea', 'b2410f', 'fdf0ea'],
    ['CTA ink on orange', '0b0b0b', 'eb6834'], ['CTA ink on orange hover', '0b0b0b', 'f07a4a'],
    ['white on night', 'ffffff', '121a26'], ['final p on night', 'c5cdd9', '121a26'], ['final micro on night', 'b7c0cd', '121a26'], ['metar-inline on night', 'e8edf5', '121a26'],
    ['code on sky', '0f2c52', 'e4edf9'], ['compare us cell', '0b0b0b', 'eef4fc'],
    ['white on id/grey', 'ffffff', '4b5260'], ['white on wind', 'ffffff', '1d63b8'], ['white on visibility', 'ffffff', '0b716d'], ['white on weather', 'ffffff', 'b93f0e'],
    ['white on clouds', 'ffffff', '6847b5'], ['white on temp', 'ffffff', '1c7040'], ['white on pressure', 'ffffff', 'ad2b5a'], ['white on trend', 'ffffff', '5a6070'],
    ['white on MVFR', 'ffffff', '1d63b8'], ['white on IFR', 'ffffff', 'b42323'], ['check green on #e3f2e8', '1c7040', 'e3f2e8'], ['cross red on #f7e4e4', 'b42323', 'f7e4e4'],
    ['sticky text', '52514e', 'fcfcfb'], ['white on ink (skip link)', 'ffffff', '0b0b0b'],
  ];
  let fails = 0;
  for (const [n, a, b] of pairs) { const r = cr(a, b); if (r < 4.5) fails++; log(`contrast ${r.toFixed(2)}:1 ${r >= 4.5 ? 'AA' : 'FAIL'}  ${n}`); }
  log('contrast failures:', fails);
}

await browser.close();
server.close();
fs.writeFileSync(path.join(SHOTS, 'report.txt'), report.join('\n'));
