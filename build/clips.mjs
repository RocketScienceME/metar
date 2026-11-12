// Viewport screenshots of key sections: node build/clips.mjs
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { serve } from './serve.mjs';
const OUT = process.env.SHOTS_DIR;
const server = await serve(8124);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const targets = (process.env.TARGETS || 'top,#inside,#look-inside,#sample,.benefits,.compare,#author,#faq,#get').split(',');
for (const [w, h] of [[1280, 860], [360, 740]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8124' + (process.env.URL || '/metar/'), { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } });
  for (const t of targets) {
    await page.evaluate(s => { const el = s === 'top' ? null : document.querySelector(s); scrollTo(0, el ? el.getBoundingClientRect().top + scrollY - 70 : 0); }, t);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(OUT, `clip-${w}-${t.replace(/[^a-z]/g, '')}.png`) });
  }
  await page.close();
}
await browser.close(); server.close();
