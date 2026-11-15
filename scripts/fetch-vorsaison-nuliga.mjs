// Einmalig: Vorsaison 2025/26 der Mannschaften II–IV aus nuLiga für den Saisonvergleich im Grafik-Studio.
// Findet über das aktuelle Teamporträt den Verein, dort die Mannschaften der Saison 2025/26, und ergänzt site/vorsaison.json.
import { readFile, writeFile } from 'node:fs/promises';
import { MiniDocument } from './minidom.mjs';
import { parseNuGroup, parseNuTeam } from './parsers.mjs';

const ROOT = new URL('..', import.meta.url), OUT = new URL('site/vorsaison.json', ROOT);
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';
const BASE = 'https://bdv-dart.liga.nu/cgi-bin/WebObjects/nuLigaDARTDE.woa/wa/';
const SEASON = '2025/26';
const sources = JSON.parse(await readFile(new URL('scripts/sources.json', ROOT), 'utf8'));
const get = async url => { for (let i = 1; i <= 4; i++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: AbortSignal.timeout(45000) }); if (!r.ok) throw new Error('HTTP ' + r.status);
  const cs = ((r.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || [, 'utf-8'])[1]; return new TextDecoder(/8859-1|latin/i.test(cs) ? 'windows-1252' : cs).decode(await r.arrayBuffer()); } catch (e) { if (i === 4) throw new Error(url + ': ' + e.message); await new Promise(s => setTimeout(s, 4000 * i)); } } };
const dec = s => s.replace(/&amp;/g, '&').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// 1) Verein finden
const cur = sources.teams['2'];
const portrait = await get(cur.teamUrl);
const club = (portrait.match(/club=(\d+)/) || [])[1];
if (!club) { console.log(portrait.slice(0, 3000)); throw new Error('Vereinsnummer nicht gefunden'); }
console.log('Verein', club);

// 2) Mannschaften der Vorsaison
const tries = [`clubTeams?club=${club}&seasonName=${encodeURIComponent(SEASON)}`, `clubTeams?club=${club}&seasonName=${SEASON.replace('/', '%2F')}`];
let found = [];
for (const t of tries) {
  const h = await get(BASE + t);
  const re = /<tr[\s\S]*?<\/tr>/g; let m;
  while ((m = re.exec(h))) {
    const row = m[0], a = row.match(/href="([^"]*teamPortrait\?[^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    if (!a) continue;
    const href = a[1].replace(/&amp;/g, '&'), champ = decodeURIComponent((href.match(/championship=([^&]+)/) || [])[1] || '').replace(/\+/g, ' ');
    if (!/25\/26|2025\/26/.test(champ)) continue;
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => dec(c[1]));
    found.push({ name: dec(a[2]), href, champ, cells });
  }
  console.log(t, '→', found.length, 'Mannschaften');
  if (found.length) break;
  console.log(h.replace(/<script[\s\S]*?<\/script>/g, '').slice(0, 4000));
}
if (!found.length) throw new Error('Keine Mannschaften der Saison ' + SEASON + ' gefunden');
found.forEach(f => console.log('-', f.name, '|', f.champ, '|', f.cells.join(' | ')));

// 3) Je Mannschaft Tabelle + Spielplan holen
const ROM = { 'II': '2', 'III': '3', 'IV': '4', 'V': '5' };
const prev = JSON.parse(await readFile(OUT, 'utf8'));
for (const f of found) {
  if (!/Clochard/i.test(f.name)) continue;
  const suf = (f.name.match(/\b(II|III|IV|V)\s*$/) || [])[1], id = suf ? ROM[suf] : null;
  if (!id || id === '1') { console.log('übersprungen (keine II–IV):', f.name); continue; }
  const teamUrl = f.href.startsWith('http') ? f.href : new URL(f.href, BASE).href;
  const group = (teamUrl.match(/group=(\d+)/) || [])[1];
  const groupUrl = BASE + 'groupPage?championship=' + encodeURIComponent(f.champ).replace(/%20/g, '+') + '&group=' + group;
  const cfg = { teamName: f.name, label: 'CDA ' + suf };
  try {
    const { table } = parseNuGroup(new MiniDocument(await get(groupUrl)), cfg);
    const team = parseNuTeam(new MiniDocument(await get(teamUrl)), cfg);
    const league = f.cells.find(c => /liga|klasse/i.test(c) && !/Clochard/.test(c)) || '';
    prev.teams[id] = { label: cfg.label, league, table, matches: team.matches, players: team.players, groupUrl, teamUrl };
    console.log('✓', cfg.label, league, table.length, 'Teams,', team.matches.length, 'Spiele');
  } catch (e) { console.log('✗', f.name, e.message); }
}
prev.fetchedNuLiga = new Date().toISOString();
await writeFile(OUT, JSON.stringify(prev));
