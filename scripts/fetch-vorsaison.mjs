// Einmalig: Spieltage der Vorsaison 2025/26 (2. Bundesliga Süd, 3K) für den Saisonvergleich im Grafik-Studio.
// Schreibt site/vorsaison.json. Die Vorsaison ändert sich nicht mehr, daher kein nächtlicher Abruf nötig.
import { writeFile } from 'node:fs/promises';
import { parse3K } from './parsers.mjs';
const API = 'https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/';
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';
const get = async u => { const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' } }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
const EVENT = 297, cfg = { teamName: 'Clochard Darter Augsburg', homeVenueMatch: 'Dinkelscherben' };
const ev = await get(API + EVENT); const phaseId = ev.phases[0].id; cfg.eventId = EVENT; cfg.phaseId = phaseId;
const base = API + EVENT;
const phase = await get(`${base}/phase/${phaseId}`);
const rounds = []; for (const r of phase.rounds || []) rounds.push(await get(`${base}/phase/${phaseId}/round/${r.id}`));
let players = []; try { players = await get(`${base}/player/results?`); } catch {}
const res = parse3K(phase, rounds, players, cfg, null);
if (!res.table.some(r => r.us)) throw new Error('CDA nicht in der Vorsaison-Tabelle');
await writeFile(new URL('../site/vorsaison.json', import.meta.url), JSON.stringify({ season: '2025/26', event: EVENT, fetched: new Date().toISOString(), teams: { 1: { table: res.table, matchdays: res.matchdays } } }));
console.log('Vorsaison:', res.matchdays.length, 'Spieltage, CDA', JSON.stringify(res.table.find(r => r.us)));
