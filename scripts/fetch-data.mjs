#!/usr/bin/env node
// Holt Tabellen, Spielpläne und Spielerbilanzen aller CDA-Mannschaften
// aus dem 3K-Portal (2. Bundesliga) und nuLiga (Bezirksligen) und schreibt site/data.json.
//
// Absicherung: Scheitert eine Quelle, bleibt der letzte gute Stand dieser Mannschaft erhalten.
// Fehler werden in .fetch-errors.txt gesammelt; der Workflow schlägt danach fehl,
// damit GitHub eine Benachrichtigung per E-Mail schickt.

import { readFile, writeFile } from 'node:fs/promises';
import { MiniDocument } from './minidom.mjs';
import { parse3K, parseNuGroup, parseNuTeam } from './parsers.mjs';

const ROOT = new URL('..', import.meta.url);
const OUT = new URL('site/data.json', ROOT);
const ERR = new URL('.fetch-errors.txt', ROOT);
const API_3K = 'https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/';
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';

const sources = JSON.parse(await readFile(new URL('scripts/sources.json', ROOT), 'utf8'));
let previous = { teams: {} };
try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* erster Lauf */ }

async function get(url, as = 'json') {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : 'text/html' }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (as === 'json') return await res.json();
      // nuLiga liefert je nach Server UTF-8 oder ISO-8859-1 – Zeichensatz aus dem Header übernehmen
      const cs = ((res.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || [, 'utf-8'])[1];
      return new TextDecoder(/8859-1|latin/i.test(cs) ? 'windows-1252' : cs).decode(await res.arrayBuffer());
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}
const html = async url => new MiniDocument(await get(url, 'text'));

async function load3K(cfg) {
  const base = API_3K + cfg.eventId;
  const phase = await get(`${base}/phase/${cfg.phaseId}`);
  const rounds = [];
  for (const r of phase.rounds || []) rounds.push(await get(`${base}/phase/${cfg.phaseId}/round/${r.id}`));
  const players = await get(`${base}/player/results?`);
  const res = parse3K(phase, rounds, players, cfg);
  if (!res.table.some(r => r.us)) throw new Error('3K: eigene Mannschaft nicht in der Tabelle gefunden');
  if (!res.matchdays.length) throw new Error('3K: keine Spieltage gefunden');
  return res;
}

async function loadNuLiga(cfg) {
  const { table } = parseNuGroup(await html(cfg.groupUrl), cfg);
  const team = parseNuTeam(await html(cfg.teamUrl), cfg);
  if (!table.some(r => r.us)) throw new Error('nuLiga: eigene Mannschaft nicht in der Tabelle gefunden');
  return { table, matches: team.matches, players: team.players };
}

const out = { updated: new Date().toISOString(), season: sources.season, teams: {} };
const errors = [];

for (const [id, cfg] of Object.entries(sources.teams)) {
  try {
    const data = cfg.type === '3k' ? await load3K(cfg) : await loadNuLiga(cfg);
    out.teams[id] = { label: cfg.label, league: cfg.league, source: cfg.type, sourceUrl: cfg.sourceUrl || cfg.groupUrl, fetched: out.updated, ...data };
    console.log(`✓ ${cfg.label}: ${data.table.length} Teams in der Tabelle`);
  } catch (e) {
    errors.push(`${cfg.label}: ${e.message}`);
    console.error(`✗ ${cfg.label}: ${e.message}`);
    if (previous.teams && previous.teams[id]) {
      out.teams[id] = { ...previous.teams[id], stale: true };
      console.error(`  → letzter Stand vom ${previous.teams[id].fetched} bleibt erhalten`);
    }
  }
}

// Nur speichern, wenn sich inhaltlich etwas geändert hat – so entstehen keine leeren Commits.
// Einmal pro Kalenderwoche wird trotzdem gespeichert, damit GitHub den Zeitplan
// auch in der Sommerpause nicht wegen Inaktivität abschaltet.
const strip = d => JSON.stringify(Object.fromEntries(Object.entries(d.teams || {}).map(([k, t]) => { const { fetched, stale, ...rest } = t; return [k, rest]; })));
const week = (() => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return `${d.getUTCFullYear()}-W${String(Math.ceil(((d - y) / 864e5 + 1) / 7)).padStart(2, '0')}`; })();
out.week = week;
const changed = strip(out) !== strip(previous) || previous.week !== week;
if (!errors.length || Object.keys(out.teams).length) {
  if (changed) { await writeFile(OUT, JSON.stringify(out, null, 1) + '\n'); console.log('data.json aktualisiert'); }
  else console.log('Keine inhaltlichen Änderungen');
}
await writeFile(ERR, errors.join('\n'));
console.log(errors.length ? `${errors.length} Quelle(n) mit Fehler` : 'Alle Quellen aktuell');
