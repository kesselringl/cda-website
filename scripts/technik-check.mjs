// Technik-Check der veröffentlichten Seite: Lighthouse (Handy + Computer), axe-Barrierefreiheit, Screenshots, Fehler in der Konsole
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { chromium, devices } from 'playwright';

const OUT = process.argv[2] || 'out';
mkdirSync(OUT, { recursive: true });
const BASE = (process.env.SITE_URL || 'https://kesselringl.github.io/cda-website').replace(/\/?$/, '/');
const PAGES = ['', 'impressum.html', 'datenschutz.html', 'steckbrief.html', 'competition.html', 'grafik-studio.html'];
const CHROME = chromium.executablePath();
const summary = [];

for (const p of PAGES) {
  for (const form of ['mobile', 'desktop']) {
    const name = (p.replace('.html', '') || 'start') + '-' + form;
    const args = [BASE + p, '--quiet', '--output=json', `--output-path=${OUT}/${name}.json`, `--chrome-path=${CHROME}`,
      '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'];
    if (form === 'desktop') args.push('--preset=desktop');
    try {
      execFileSync('npx', ['lighthouse', ...args], { stdio: 'inherit', timeout: 180000 });
      const r = JSON.parse(readFileSync(`${OUT}/${name}.json`, 'utf8'));
      const sc = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
      const fails = Object.values(r.audits).filter(a => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable')
        .map(a => ({ id: a.id, score: a.score, title: a.title, value: a.displayValue || '', items: (a.details && a.details.items || []).slice(0, 12).map(i => ({ url: i.url, node: i.node && (i.node.snippet || '').slice(0, 220), label: i.node && i.node.nodeLabel, wasted: i.wastedBytes || i.wastedMs, total: i.totalBytes })) }));
      const m = r.audits;
      summary.push({ page: name, scores: sc, lcp: m['largest-contentful-paint']?.displayValue, cls: m['cumulative-layout-shift']?.displayValue, tbt: m['total-blocking-time']?.displayValue, fcp: m['first-contentful-paint']?.displayValue, weight: m['total-byte-weight']?.displayValue, fails });
    } catch (e) { summary.push({ page: name, error: String(e.message).slice(0, 300) }); }
  }
}

// axe + Konsole + Screenshots in verschiedenen Größen
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const b = await chromium.launch();
const extra = [];
for (const p of PAGES.slice(0, 5)) {
  for (const [label, ctxOpt] of [['iphone', devices['iPhone 13']], ['tablet', devices['iPad Mini']], ['laptop', { viewport: { width: 1366, height: 800 } }]]) {
    const ctx = await b.newContext(ctxOpt); const pg = await ctx.newPage(); const logs = [];
    pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 200)); });
    pg.on('pageerror', e => logs.push('pageerror: ' + e.message));
    await pg.goto(BASE + p, { waitUntil: 'networkidle' }).catch(e => logs.push('goto: ' + e.message));
    await pg.waitForTimeout(1500);
    const over = await pg.evaluate(() => { const W = document.documentElement.clientWidth, bad = []; document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1 && getComputedStyle(el).position !== 'fixed') bad.push((el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + [...el.classList].join('.')) + ' → ' + Math.round(r.right - W) + 'px'); }); return { scrollW: document.documentElement.scrollWidth, W, bad: bad.slice(0, 15) }; });
    const small = await pg.evaluate(() => { const out = []; document.querySelectorAll('a,button,input,select,[role=button]').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.height && (r.height < 24 || r.width < 24) && getComputedStyle(el).visibility !== 'hidden') out.push((el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }); return out.slice(0, 25); });
    let ax = null;
    if (label === 'iphone') { await pg.addScriptTag({ content: axe }); ax = await pg.evaluate(async () => { const r = await axe.run(document, { resultTypes: ['violations'] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 8).map(n => n.target.join(' ') + ' | ' + (n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 200)) })); }); }
    await pg.screenshot({ path: `${OUT}/${(p.replace('.html', '') || 'start')}-${label}.png`, fullPage: label !== 'laptop' ? false : false });
    extra.push({ page: p || 'start', device: label, overflow: over, smallTargets: small, axe: ax, console: logs });
    await ctx.close();
  }
}
await b.close();
writeFileSync(`${OUT}/summary.json`, JSON.stringify({ base: BASE, at: new Date().toISOString(), lighthouse: summary, browser: extra }, null, 1));
console.log(summary.map(s => s.page + ' ' + JSON.stringify(s.scores || s.error)).join('\n'));
