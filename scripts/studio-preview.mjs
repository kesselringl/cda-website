// Rendert Beispielbilder aus dem Grafik-Studio (zur Kontrolle der Designs).
// Aufruf: node scripts/studio-preview.mjs <ausgabeordner> [typ,design,format ...]
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const out = process.argv[2] || 'previews';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]); const f = join('site', p === '/' ? 'index.html' : p);
  try { const b = await readFile(f); res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(8799);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:8799/studio.html');
await page.waitForFunction(() => window.__studio && document.querySelector('#type option'), null, { timeout: 30000 });
await page.waitForTimeout(1500);
let combos = process.argv.slice(3);
if (!combos.length) {
  const { types, themes } = await page.evaluate(() => ({ types: window.__studio.types, themes: window.__studio.themes }));
  combos = [];
  types.forEach((t, i) => { combos.push(`${t},default,feed`); combos.push(`${t},${themes[(i * 5 + 3) % themes.length]},${i % 3 ? 'feed' : 'story'}`); });
  themes.forEach((th, i) => combos.push(`ergebnis,${th},feed`));
}
for (const c of combos) {
  const [type, theme, format, seed] = c.split(',');
  await page.evaluate(async ([type, theme, format, seed]) => {
    await window.__studio.set({ type, pick: null, format: format || 'feed', seed: +(seed || 1), theme: theme || 'default' });
  }, [type, theme, format, seed]);
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => document.getElementById('cv').toDataURL('image/png'));
  await writeFile(join(out, c.replace(/,/g, '_') + '.png'), Buffer.from(d.split(',')[1], 'base64'));
}
console.log('Bilder:', combos.length, 'Fehler:', errors.length ? errors : 'keine');
await browser.close(); server.close();
if (errors.length) process.exit(1);
