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
  ['archivo', 'Archivo', [400, 500, 600, 700, 800, 900]],
  // nur für das Grafik-Studio (werden erst geladen, wenn eine Grafik sie braucht)
  ['anton', 'Anton', [400]],
  ['permanent-marker', 'Permanent Marker', [400]],
  ['rubik-mono-one', 'Rubik Mono One', [400]],
  ['alfa-slab-one', 'Alfa Slab One', [400]],
  ['playfair-display', 'Playfair Display', [700, 900]]
];

async function selfHostFonts() {
  try {
    await rm(TMP, { recursive: true, force: true });
    await mkdir(TMP, { recursive: true });
    await mkdir(FONTS, { recursive: true });
    let css = '';
    for (const [idx, [pkg, family, weights]] of WANT.entries()) {
      let part = '';
      try {
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
          part += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(${name}) format("woff2");unicode-range:${range}}\n`;
        }
      }
      css += part;
      } catch (e) { if (idx < 2) throw e; console.warn(`Schrift ${family} übersprungen: ${e.message}`); }
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
// Adresse der Seite kommt im Workflow von GitHub Pages (passt sich nach dem Domain-Umzug automatisch an)
const BASE = (process.env.SITE_URL || 'https://kesselringl.github.io/cda-website').replace(/\/?$/, '/');
const PRIVATE = new Set(['grafik-studio.html', 'studio.html', 'competition.html', 'steckbrief.html']);
const PUBLIC = ['index.html']; // Impressum und Datenschutz sind bewusst nicht für Suchmaschinen (noindex)
const esc = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Strukturierte Daten für Google: Verein + nächste Competition-Termine
async function jsonLd() {
  const org = { '@type': 'SportsOrganization', '@id': BASE + '#verein', name: 'Clochard Darter Augsburg e.V.', alternateName: 'CDA',
    url: BASE, logo: BASE + 'icon-512.png', image: BASE + 'og.jpg', sport: 'Steeldart', foundingDate: '1986',
    description: 'Steeldartverein aus Augsburg mit vier Ligamannschaften, darunter die 2. Bundesliga Süd, und offener Competition jeden Donnerstag.',
    address: { '@type': 'PostalAddress', streetAddress: 'Bismarckstraße 7', postalCode: '86159', addressLocality: 'Augsburg', addressCountry: 'DE' },
    sameAs: ['https://www.instagram.com/clocharddarteraugsburg/'] };
  let ev = [];
  try {
    ev = JSON.parse(await readFile(new URL('kalender/naechste.json', SITE), 'utf8')).map(e => {
      const [street, place] = e.venue.split(', ').slice(1).length ? [e.venue.split(', ')[1], e.venue.split(', ')[2]] : ['', ''];
      return { '@type': 'SportsEvent', name: e.name + ' – Clochard Darter Augsburg', description: e.text,
        startDate: e.finals ? e.date : `${e.date}T20:00:00${e.tz}`, ...(e.finals ? {} : { endDate: `${e.date}T23:00:00${e.tz}` }),
        eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: e.venue.split(', ')[0], address: { '@type': 'PostalAddress', streetAddress: street,
          postalCode: (place || '').split(' ')[0], addressLocality: (place || '').split(' ').slice(1).join(' '), addressCountry: 'DE' } },
        organizer: { '@id': BASE + '#verein' }, image: BASE + 'og.jpg', url: e.url };
    });
  } catch { /* ohne Kalender nur der Verein */ }
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': [org, ...ev] }).replace(/</g, '\\u003c') + '</script>';
}
const LD = await jsonLd();
const GOOGLE = /\s*<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g;
const DESC = {
  'index.html': 'Clochard Darter Augsburg e.V. – Steeldart in Augsburg seit 1986. Vier Ligamannschaften, 2. Bundesliga Süd, offene Competition jeden Donnerstag im Bismarck Bistro.',
  'impressum.html': 'Impressum des Clochard Darter Augsburg e.V.',
  'datenschutz.html': 'Datenschutzerklärung des Clochard Darter Augsburg e.V.',
  'steckbrief.html': 'Steckbrief-Formular für die Spielerinnen und Spieler des Clochard Darter Augsburg e.V.',
  'grafik-studio.html': 'Grafik-Studio des Clochard Darter Augsburg e.V. (intern, mit Anmeldung).',
  'studio.html': 'Weiterleitung zum Grafik-Studio.',
  'competition.html': 'Spielbetrieb der CDA-Donnerstags-Competition: Abend live verfolgen, Turnierleitung und Boards.'
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
<meta name="description" content="${esc(DESC[f] || DESC['index.html'])}">
${PRIVATE.has(f) ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${BASE}${f === 'index.html' ? '' : f}">`}
<meta property="og:site_name" content="Clochard Darter Augsburg e.V.">
<meta property="og:locale" content="de_DE">
<meta property="og:type" content="website">
<meta property="og:title" content="${f === 'index.html' ? 'Clochard Darter Augsburg e.V. – Steeldart seit 1986' : esc((s.match(/<title>([^<]*)<\/title>/) || [, 'Clochard Darter Augsburg e.V.'])[1])}">
<meta property="og:description" content="${esc(DESC[f] || DESC['index.html'])}">
<meta property="og:url" content="${BASE}${f === 'index.html' ? '' : f}">
<meta property="og:image" content="${BASE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Clochard Darter Augsburg – Steeldart in Augsburg seit 1986">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0E1510">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="${f === 'grafik-studio.html' ? 'studio-180.png' : 'apple-touch-icon.png'}">
<link rel="manifest" href="${f === 'grafik-studio.html' ? 'studio.webmanifest' : 'manifest.webmanifest'}">
<meta name="apple-mobile-web-app-title" content="${f === 'grafik-studio.html' ? 'CDA Studio' : 'CDA'}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${f === 'index.html' ? LD + '\n' : ''}${fontsOk ? '<link rel="stylesheet" href="fonts/fonts.css">\n' : ''}${head.trim()}
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

// Suchmaschinen: Sitemap + robots.txt mit der aktuellen Adresse
const today = new Date().toISOString().slice(0, 10);
await writeFile(new URL('sitemap.xml', SITE), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC.map(f => `  <url><loc>${BASE}${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod><changefreq>${f === 'index.html' ? 'daily' : 'yearly'}</changefreq><priority>${f === 'index.html' ? '1.0' : '0.3'}</priority></url>`).join('\n')}
</urlset>
`);
await writeFile(new URL('robots.txt', SITE), `User-agent: *
Disallow: /grafik-studio.html
Disallow: /studio.html
Disallow: /steckbrief.html
Sitemap: ${BASE}sitemap.xml
`);
console.log('✓ sitemap.xml, robots.txt für', BASE);
