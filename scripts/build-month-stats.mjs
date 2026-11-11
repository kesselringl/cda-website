// Monatswerte für den „Spieler des Monats“ im Grafik-Studio.
// data.json enthält nur Saison-Summen. Aus der Git-Historie wird für jeden Monat der Stand
// kurz vor Monatsbeginn geholt; die Differenz zum Stand danach ergibt die Bilanz im Monat.
// Schreibt site/monatswerte.json (wird im Workflow gebaut, nicht eingecheckt).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64e6 });
let log = [];
try { log = git('log', '--format=%H %cI', '--', 'site/data.json').trim().split('\n').filter(Boolean).map(l => { const [h, d] = l.split(' '); return { h, t: new Date(d) }; }); }
catch (e) { console.warn('Git-Historie nicht lesbar:', e.message); }

function snapshot(h) {
  try {
    const d = JSON.parse(git('show', `${h}:site/data.json`)); const o = {};
    for (const [k, t] of Object.entries(d.teams || {})) for (const p of t.players || []) o[`${k}|${p.name}`] = { single: p.single || null, double: p.double || null };
    return o;
  } catch { return null; }
}

const now = new Date(), months = {};
for (let i = 0; i < 8; i++) {
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
  const key = first.toISOString().slice(0, 7), boundary = new Date(first.getTime() - 3600e3); // Monatsbeginn in deutscher Zeit
  const c = log.find(x => x.t < boundary); if (!c) continue;
  const players = snapshot(c.h); if (players) months[key] = { start: c.t.toISOString(), players };
}
writeFileSync('site/monatswerte.json', JSON.stringify({ generated: now.toISOString(), months }));
console.log('Monatswerte:', Object.keys(months).join(', ') || 'keine (zu wenig Historie)');
