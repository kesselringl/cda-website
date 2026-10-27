#!/usr/bin/env node
// Bereitet site/ für die Veröffentlichung vor (läuft nur im GitHub-Ablauf, verändert keine Dateien im Repository):
//  1. Jede Seite bekommt ein vollständiges HTML-Gerüst (Zeichensatz, Handy-Ansicht, Vorschaubild).
//  2. Die Schriften werden selbst gehostet statt von Google geladen (DSGVO).
//     Klappt der Download nicht, wird Google trotzdem entfernt und es greifen die Ersatzschriften.

import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const SITE = new URL('../site/', import.meta.url);
const FONTS = new URL('fonts/', SITE);
const TMP = new URL('../.fonts-tmp/', import.meta.url);

const WANT = [
  ['big-shoulders-display', 'Big Shoulders Display', [600, 800, 900]],
  ['archivo', 'Archivo', [400, 500, 600, 700]]
];

async function selfHostFonts() {
  try {
    await rm(TMP, { recursive: true, force: true });
    await mkdir(TMP, { recursive: true });
    await mkdir(FONTS, { recursive: true });
    let css = '';
    for (const [pkg, family, weights] of WANT) {
      const tgz = execFileSync('npm', ['pack', `@fontsource/${pkg}@5`, '--silent'], { cwd: TMP, encoding: 'utf8' }).trim().split('\n').pop();
      execFileSync('tar', ['-xzf', tgz], { cwd: TMP });
      for (const w of weights) {
        for (const subset of ['latin', 'latin-ext']) {
          const name = `${pkg}-${subset}-${w}-normal.woff2`;
          const src = new URL(`package/files/${name}`, TMP);
          if (!existsSync(src)) { if (subset === 'latin') throw new Error(`${name} fehlt im Paket`); continue; }
          await writeFile(new URL(name, FONTS), await readFile(src));
          const range = subset === 'latin'
            ? 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
            : 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
          css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(${name}) format("woff2");unicode-range:${range}}\n`;
        }
      }
      await rm(new URL('package/', TMP), { recursive: true, force: true });
    }
    await writeFile(new URL('fonts.css', FONTS), css);
    console.log('✓ Schriften selbst gehostet');
    return true;
  } catch (e) {
    console.warn('! Schriften konnten nicht geladen werden, Ersatzschriften werden genutzt:', e.message);
    return false;
  } finally {
    await rm(TMP, { recursive: true, force: true });
  }
}

const fontsOk = await selfHostFonts();
const GOOGLE = /\s*<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g;
const DESC = {
  'index.html': 'Clochard Darter Augsburg e.V. – Steeldart in Augsburg seit 1986. Vier Ligamannschaften, 2. Bundesliga Süd, offene Competition jeden Donnerstag im Bismarck Bistro.',
  'impressum.html': 'Impressum des Clochard Darter Augsburg e.V.',
  'datenschutz.html': 'Datenschutzerklärung des Clochard Darter Augsburg e.V.'
};

for (const f of (await readdir(SITE)).filter(n => n.endsWith('.html'))) {
  let s = await readFile(new URL(f, SITE), 'utf8');
  s = s.replace(GOOGLE, '').replace(/<meta name="claude:[^>]*>\s*/g, '');
  if (!/^\s*<!doctype/i.test(s)) {
    const cut = s.search(/\n<(header|div|main|section|nav)\b/);
    const head = cut > 0 ? s.slice(0, cut) : '';
    const body = cut > 0 ? s.slice(cut) : s;
    s = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${DESC[f] || DESC['index.html']}">
<meta property="og:title" content="Clochard Darter Augsburg e.V.">
<meta property="og:description" content="${DESC[f] || DESC['index.html']}">
<meta property="og:image" content="logo.png">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="logo.png">
${fontsOk ? '<link rel="stylesheet" href="fonts/fonts.css">\n' : ''}${head.trim()}
<style>[hidden]{display:none!important}body{margin:0}img{max-width:100%}</style>
</head>
<body>${body}
</body>
</html>
`;
  }
  await writeFile(new URL(f, SITE), s);
  console.log('✓', f);
}
