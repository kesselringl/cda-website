// Einmalige Suche: 3K-Veranstaltung der Vorsaison (2025/26) für den Saisonvergleich finden.
import { writeFile, mkdir } from 'node:fs/promises';
const API = 'https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/';
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';
const out = [];
async function get(u) { try { const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) }); const t = await r.text(); return { s: r.status, t }; } catch (e) { return { s: 0, t: e.message }; } }
const log = (k, v) => { out.push(`## ${k}\n${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 6000)); };
const ev = await get(API + 'event/1408'); log('event/1408', ev.t);
for (const u of ['events/10', 'event?organizerId=10', 'events', 'event/list/10', 'organizer/10/events', 'events/10/events']) { const r = await get(API + u); log(u + ' [' + r.s + ']', r.t); }
const hits = [];
for (let id = 1000; id < 1408; id++) {
  const r = await get(API + 'event/' + id); if (r.s !== 200) continue;
  try { const j = JSON.parse(r.t); const name = JSON.stringify([j.name, j.title, j.season, j.seasonName, j.description]).slice(0, 200); if (/bundesliga/i.test(r.t.slice(0, 3000))) hits.push(id + ' ' + name); } catch {}
  await new Promise(r => setTimeout(r, 120));
}
log('hits', hits.join('\n'));
await mkdir('previews', { recursive: true }); await writeFile('previews/probe.txt', out.join('\n\n'));
