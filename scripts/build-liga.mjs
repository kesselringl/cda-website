#!/usr/bin/env node
// Spielberichte der ganzen 2. Bundesliga (3K) für den Gegner-Check im Grafik-Studio → site/liga.json
// Je Begegnung: alle 12 Spiele (8 Einzel, 4 Doppel) mit Spielern, Legs und Average.
// Bereits geholte Berichte bleiben in site/liga.json und werden nicht erneut abgerufen.
// Die Daten sind dieselben, die das 3K-Portal öffentlich zeigt.

import { readFile, writeFile } from 'node:fs/promises';
import { firstLast, berlinDateTime } from './parsers.mjs';

const ROOT = new URL('..', import.meta.url);
const OUT = new URL('site/liga.json', ROOT);
const API = 'https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/';
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';

const sources = JSON.parse(await readFile(new URL('scripts/sources.json', ROOT), 'utf8'));
const cfg = Object.values(sources.teams).find(t => t.type === '3k');

async function get(url) {
  for (let a = 1; a <= 3; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(45000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (a === 3) throw new Error(url + ': ' + e.message);
      await new Promise(r => setTimeout(r, 4000 * a));
    }
  }
}

let prev = { matches: [] };
try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* erster Lauf */ }
const known = new Map((prev.matches || []).filter(m => m.games && m.games.length).map(m => [m.id, m]));

const avg = p => (p && p.darts ? Math.round(p.score / p.darts * 300) / 100 : null);
const names = p => String((p && p.displayName) || '').split(/\s*&\s*/).filter(Boolean).map(firstLast);

try {
  const base = API + 'event/' + cfg.eventId;
  const phase = await get(`${base}/phase/${cfg.phaseId}`);
  const matches = [];
  let fetched = 0;
  for (const [i, r] of (phase.rounds || []).entries()) {
    const rd = await get(`${base}/phase/${cfg.phaseId}/round/${r.id}`);
    for (const m of rd.matches || []) {
      if (m.byeHome || m.byeAway || !m.participantHome || !m.participantGuest) continue;
      const dt = berlinDateTime(m.datePlanned || r.dateFrom);
      const done = m.statusCd === 'FINISH';
      const row = {
        id: m.id, round: (r.index != null ? r.index : i) + 1, date: dt.date, time: dt.time,
        home: m.participantHome.displayName, away: m.participantGuest.displayName,
        score: done ? `${m.setsHome}:${m.setsAway}` : null,
        legs: done ? `${m.legsHome}:${m.legsAway}` : null,
        games: []
      };
      if (done) {
        if (known.has(m.id)) row.games = known.get(m.id).games;
        else {
          try {
            const rep = await get(`${base}/match/${m.id}/report`);
            row.games = (rep || []).filter(g => g.statusCd === 'FINISH').sort((a, b) => a.gameNr - b.gameNr).map(g => ({
              nr: g.gameNr, t: g.matchTypeCd === 'DP' ? 'D' : 'E',
              h: names(g.participantHome), a: names(g.participantGuest),
              lh: g.legsHome, la: g.legsAway,
              ah: avg(g.participantHome), aa: avg(g.participantGuest)
            }));
            fetched++;
            await new Promise(r => setTimeout(r, 300));
          } catch (e) { console.warn('! Spielbericht', m.id, e.message); }
        }
      }
      matches.push(row);
    }
  }
  const out = { updated: new Date().toISOString(), league: cfg.league, us: cfg.teamName, matches };
  await writeFile(OUT, JSON.stringify(out));
  console.log(`liga.json: ${matches.length} Begegnungen, ${matches.filter(m => m.games.length).length} mit Spielbericht (${fetched} neu geholt)`);
} catch (e) {
  // Ausfall des Portals: alter Stand bleibt stehen, der Lauf geht weiter
  console.log('::warning::Gegner-Check-Daten nicht aktualisiert: ' + e.message);
}
